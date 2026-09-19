package nui

import (
	"context"
	"sync"
	"time"

	"github.com/nats-io/nats.go"
	"github.com/nats-nui/nui/internal/connection"
)

const (
	watchLease      = 15 * time.Minute
	watchSweepEvery = 30 * time.Second
)

// coreWatchHub holds at most one live Core subscribe per connection.
type coreWatchHub struct {
	mu     sync.Mutex
	byConn map[string]*coreWatch
}

type coreWatch struct {
	mu         sync.Mutex
	filter     string
	discardSys bool
	nc         *nats.Conn
	sub        *nats.Subscription
	hits       map[string]*CoreSubject
	truncated  bool
	dropped    int
	touched    time.Time
	stop       context.CancelFunc
}

func newCoreWatchHub() *coreWatchHub {
	return &coreWatchHub{byConn: map[string]*coreWatch{}}
}

func (h *coreWatchHub) watching(id string) bool {
	h.mu.Lock()
	defer h.mu.Unlock()
	return h.byConn[id] != nil
}

func (h *coreWatchHub) snapshot(id, filter string, cfg *connection.Connection, discardSys bool) *CoreCatalog {
	h.mu.Lock()
	w := h.byConn[id]
	if w != nil && w.filter == filter && w.discardSys == discardSys {
		w.mu.Lock()
		w.touched = time.Now()
		out := w.copyCatalog()
		w.mu.Unlock()
		h.mu.Unlock()
		return out
	}
	if w != nil {
		w.stop()
		delete(h.byConn, id)
	}
	h.mu.Unlock()

	next, err := startCoreWatch(filter, cfg, discardSys)
	if err != nil {
		return &CoreCatalog{Filter: filter, Subjects: []CoreSubject{}, Error: coreUserError(err)}
	}

	h.mu.Lock()
	if prev := h.byConn[id]; prev != nil {
		prev.stop()
	}
	h.byConn[id] = next
	next.mu.Lock()
	out := next.copyCatalog()
	next.mu.Unlock()
	h.mu.Unlock()
	return out
}

func (h *coreWatchHub) read(id string) *CoreCatalog {
	h.mu.Lock()
	w := h.byConn[id]
	h.mu.Unlock()
	if w == nil {
		return nil
	}
	w.mu.Lock()
	defer w.mu.Unlock()
	w.touched = time.Now()
	return w.copyCatalog()
}

func (h *coreWatchHub) stop(id string) {
	h.mu.Lock()
	w := h.byConn[id]
	if w != nil {
		delete(h.byConn, id)
	}
	h.mu.Unlock()
	if w != nil {
		w.stop()
	}
}

func (h *coreWatchHub) sweep(now time.Time) {
	h.mu.Lock()
	var stale []*coreWatch
	for id, w := range h.byConn {
		w.mu.Lock()
		idle := now.Sub(w.touched)
		w.mu.Unlock()
		if idle > watchLease {
			stale = append(stale, w)
			delete(h.byConn, id)
		}
	}
	h.mu.Unlock()
	for _, w := range stale {
		w.stop()
	}
}

func (h *coreWatchHub) startJanitor(ctx context.Context) {
	go func() {
		tick := time.NewTicker(watchSweepEvery)
		defer tick.Stop()
		for {
			select {
			case <-ctx.Done():
				h.mu.Lock()
				left := h.byConn
				h.byConn = map[string]*coreWatch{}
				h.mu.Unlock()
				for _, w := range left {
					w.stop()
				}
				return
			case now := <-tick.C:
				h.sweep(now)
			}
		}
	}()
}

func startCoreWatch(filter string, cfg *connection.Connection, discardSys bool) (*coreWatch, error) {
	nc, err := connection.DialOnce(cfg)
	if err != nil {
		return nil, err
	}
	ch := make(chan *nats.Msg, coreSubscribeBuffer)
	sub, err := nc.ChanSubscribe(filter, ch)
	if err != nil {
		nc.Close()
		return nil, err
	}
	_ = sub.SetPendingLimits(corePendingMsgs, corePendingBytes)
	if err := nc.Flush(); err != nil {
		_ = sub.Unsubscribe()
		nc.Close()
		return nil, err
	}
	ctx, cancel := context.WithCancel(context.Background())
	w := &coreWatch{
		filter:     filter,
		discardSys: discardSys,
		nc:         nc,
		sub:        sub,
		hits:       map[string]*CoreSubject{},
		touched:    time.Now(),
		stop:       cancel,
	}
	go w.loop(ctx, ch)
	return w, nil
}

func (w *coreWatch) loop(ctx context.Context, ch <-chan *nats.Msg) {
	defer func() {
		_ = w.sub.Unsubscribe()
		w.nc.Close()
	}()
	for {
		select {
		case <-ctx.Done():
			return
		case msg, ok := <-ch:
			if !ok {
				return
			}
			w.record(msg)
		}
	}
}

func (w *coreWatch) record(msg *nats.Msg) {
	if msg == nil {
		return
	}
	if hideInternal(w.discardSys, msg.Subject) {
		return
	}
	w.mu.Lock()
	defer w.mu.Unlock()
	hit, exists := w.hits[msg.Subject]
	if !exists {
		if len(w.hits) >= maxCoreSubjects {
			w.truncated = true
			dropped, err := w.sub.Dropped()
			if err == nil {
				w.dropped = dropped
			}
			return
		}
		hit = &CoreSubject{Subject: msg.Subject}
		w.hits[msg.Subject] = hit
	}
	hit.Count++
}

func (w *coreWatch) copyCatalog() *CoreCatalog {
	out := &CoreCatalog{
		Filter:    w.filter,
		ListenMs:  0,
		Truncated: w.truncated,
		Dropped:   w.dropped,
		Watching:  true,
		Subjects:  make([]CoreSubject, 0, len(w.hits)),
	}
	for _, hit := range w.hits {
		out.Subjects = append(out.Subjects, *hit)
	}
	out.Heard = len(out.Subjects)
	sortCoreSubjects(out.Subjects)
	if dropped, err := w.sub.Dropped(); err == nil && dropped > out.Dropped {
		out.Dropped = dropped
	}
	return out
}
