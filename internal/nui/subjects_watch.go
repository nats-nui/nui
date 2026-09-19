package nui

import (
	"context"
	"sync"
	"time"

	"github.com/nats-io/nats.go"
	"github.com/nats-nui/nui/internal/connection"
)

const (
	watchLease      = time.Minute
	watchSweepEvery = 30 * time.Second
)

// Each connection has one listener, including while its dial is pending.
type coreWatchHub struct {
	mu     sync.Mutex
	byConn map[string]*coreWatch
	closed bool
}

type coreWatch struct {
	mu         sync.Mutex
	filter     string
	owner      string
	discardSys bool
	sub        *nats.Subscription
	hits       map[string]*CoreSubject
	truncated  bool
	dropped    int
	err        error
	watching   bool
	touched    time.Time
	stop       context.CancelFunc
	ready      chan struct{}
}

func newCoreWatchHub() *coreWatchHub {
	return &coreWatchHub{byConn: map[string]*coreWatch{}}
}

func (h *coreWatchHub) snapshot(id, filter string, cfg *connection.Connection, discardSys bool, owner string) *CoreCatalog {
	h.mu.Lock()
	if h.closed {
		h.mu.Unlock()
		return &CoreCatalog{Subjects: []CoreSubject{}, Error: "server stopped"}
	}
	prev := h.byConn[id]
	reuse := prev != nil && prev.filter == filter && prev.discardSys == discardSys && prev.owner == owner
	if reuse {
		select {
		case <-prev.ready:
			prev.mu.Lock()
			reuse = prev.watching
			prev.mu.Unlock()
		default:
		}
	}
	if reuse {
		h.mu.Unlock()
		<-prev.ready
		prev.mu.Lock()
		defer prev.mu.Unlock()
		prev.touched = time.Now()
		return prev.copyCatalog()
	}
	ctx, cancel := context.WithCancel(context.Background())
	w := &coreWatch{
		filter: filter, owner: owner, discardSys: discardSys,
		hits: map[string]*CoreSubject{}, touched: time.Now(),
		stop: cancel, ready: make(chan struct{}),
	}
	h.byConn[id] = w
	h.mu.Unlock()
	if prev != nil {
		prev.stop()
		<-prev.ready
	}
	w.start(ctx, cfg)
	close(w.ready)
	w.mu.Lock()
	defer w.mu.Unlock()
	return w.copyCatalog()
}

func (h *coreWatchHub) read(id, owner string) *CoreCatalog {
	h.mu.Lock()
	w := h.byConn[id]
	h.mu.Unlock()
	if w == nil || w.owner != owner {
		return nil
	}
	<-w.ready
	w.mu.Lock()
	defer w.mu.Unlock()
	w.touched = time.Now()
	return w.copyCatalog()
}

func (h *coreWatchHub) stopSession(id, owner string) {
	h.mu.Lock()
	defer h.mu.Unlock()
	if w := h.byConn[id]; w != nil && w.owner == owner {
		delete(h.byConn, id)
		w.stop()
	}
}

func (h *coreWatchHub) stop(id string) {
	h.mu.Lock()
	w := h.byConn[id]
	delete(h.byConn, id)
	h.mu.Unlock()
	if w != nil {
		w.stop()
	}
}

func (h *coreWatchHub) close() {
	h.mu.Lock()
	h.closed = true
	left := h.byConn
	h.byConn = map[string]*coreWatch{}
	h.mu.Unlock()
	for _, w := range left {
		w.stop()
	}
}

func (h *coreWatchHub) sweep(now time.Time) {
	h.mu.Lock()
	defer h.mu.Unlock()
	for id, w := range h.byConn {
		w.mu.Lock()
		idle := now.Sub(w.touched)
		w.mu.Unlock()
		if idle > watchLease {
			delete(h.byConn, id)
			w.stop()
		}
	}
}

func (h *coreWatchHub) startJanitor(ctx context.Context) {
	go func() {
		tick := time.NewTicker(watchSweepEvery)
		defer tick.Stop()
		for {
			select {
			case <-ctx.Done():
				h.close()
				return
			case now := <-tick.C:
				h.sweep(now)
			}
		}
	}()
}

func (w *coreWatch) start(ctx context.Context, cfg *connection.Connection) {
	if ctx.Err() != nil {
		return
	}
	nc, err := connection.DialOnce(cfg)
	if err != nil {
		w.mu.Lock()
		w.err = err
		w.mu.Unlock()
		return
	}
	if ctx.Err() != nil {
		nc.Close()
		return
	}
	errs := make(chan error, 1)
	report := func(err error) {
		select {
		case errs <- err:
		default:
		}
	}
	nc.SetErrorHandler(func(_ *nats.Conn, _ *nats.Subscription, err error) { report(err) })
	nc.SetClosedHandler(func(_ *nats.Conn) { report(nats.ErrConnectionClosed) })
	// Queue names only; NATS bounds the callback queue by both bytes and count.
	names := make(chan string, coreSubscribeBuffer)
	sub, err := nc.Subscribe(w.filter, func(msg *nats.Msg) {
		if hideInternal(w.discardSys, msg.Subject) {
			return
		}
		select {
		case names <- msg.Subject:
		default:
			report(nats.ErrSlowConsumer)
		}
	})
	if err == nil {
		err = sub.SetPendingLimits(corePendingMsgs, corePendingBytes)
	}
	if err == nil {
		flushCtx, cancel := context.WithTimeout(ctx, 2*time.Second)
		err = nc.FlushWithContext(flushCtx)
		cancel()
	}
	if err == nil {
		err = nc.LastError()
	}
	if err != nil || ctx.Err() != nil {
		nc.Close()
		w.mu.Lock()
		w.err = err
		w.mu.Unlock()
		return
	}
	w.mu.Lock()
	w.sub, w.watching = sub, true
	w.mu.Unlock()
	go func() {
		defer func() {
			w.mu.Lock()
			if dropped, err := sub.Dropped(); err == nil {
				w.dropped += dropped
			}
			w.watching = false
			w.mu.Unlock()
			nc.Close()
		}()
		for {
			select {
			case <-ctx.Done():
				return
			case err := <-errs:
				w.mu.Lock()
				w.err = err
				w.mu.Unlock()
				return
			case subject := <-names:
				w.mu.Lock()
				hit := w.hits[subject]
				if hit == nil {
					if len(w.hits) >= maxCoreSubjects {
						w.truncated = true
						w.dropped++
						w.mu.Unlock()
						return
					}
					hit = &CoreSubject{Subject: subject}
					w.hits[subject] = hit
				}
				hit.Count++
				w.mu.Unlock()
			}
		}
	}()
}

func (w *coreWatch) copyCatalog() *CoreCatalog {
	out := &CoreCatalog{
		Filter: w.filter, Truncated: w.truncated, Dropped: w.dropped,
		Error: coreUserError(w.err), Watching: w.watching,
		Subjects: make([]CoreSubject, 0, len(w.hits)),
	}
	for _, hit := range w.hits {
		out.Subjects = append(out.Subjects, *hit)
	}
	out.Heard = len(out.Subjects)
	sortCoreSubjects(out.Subjects)
	if w.sub != nil {
		if dropped, err := w.sub.Dropped(); err == nil && dropped > out.Dropped {
			out.Dropped = dropped
		}
	}
	return out
}
