package nui

import (
	"context"
	"errors"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/nats-io/nats.go"
	"github.com/nats-nui/nui/internal/connection"
)

// HandleCoreListen is the Core NATS catalog. watch=1 starts or reads
// the live subscribe. A GET without watch=1 returns that snapshot if
// one is already running, otherwise it is a time-boxed sample.
// Empty filter is not `>`.
func (a *App) HandleCoreListen(c *fiber.Ctx) error {
	if c.Params("id") == "" {
		return c.Status(422).JSON("id is required")
	}
	id := c.Params("id")
	watch := queryBoolDefault(c, "watch", false)
	discardSys := queryBoolDefault(c, "discard_sys", true)
	filter := normalizeListenFilter(c.Query("filter"))

	if watch {
		if err := validateListenFilter(filter); err != nil {
			return c.Status(422).JSON(NewError(err.Error()))
		}
		return a.coreWatchSnapshot(c, id, filter, discardSys)
	}
	if a.coreWatches != nil && a.coreWatches.watching(id) {
		if out := a.coreWatches.read(id); out != nil {
			return c.JSON(out)
		}
	}
	if err := validateListenFilter(filter); err != nil {
		return c.Status(422).JSON(NewError(err.Error()))
	}
	listenMs := queryIntDefault(c, "listen_ms", defaultListenMs)
	if listenMs < minListenMs {
		listenMs = minListenMs
	}
	if listenMs > maxListenMs {
		listenMs = maxListenMs
	}

	var parent context.Context = c.Context()
	release := func() {}
	if a.coreListens != nil {
		parent, release = a.coreListens.takeover(id, parent)
	}
	defer release()

	cfg, err := a.nui.ConnRepo.GetById(id)
	if err != nil {
		return a.logAndFiberError(c, err, 404)
	}
	nc, err := connection.DialOnce(cfg)
	if err != nil {
		return a.logAndFiberError(c, err, 422)
	}
	defer nc.Close()

	budget := time.Duration(listenMs)*time.Millisecond + 2*time.Second
	ctx, cancel := context.WithTimeout(parent, budget)
	defer cancel()

	out := sampleCoreLimited(ctx, nc, filter, time.Duration(listenMs)*time.Millisecond, maxCoreSubjects, discardSys)
	return c.JSON(out)
}

func (a *App) HandleCoreWatchStop(c *fiber.Ctx) error {
	if c.Params("id") == "" {
		return c.Status(422).JSON("id is required")
	}
	if a.coreWatches != nil {
		a.coreWatches.stop(c.Params("id"))
	}
	return c.JSON(&CoreCatalog{Subjects: []CoreSubject{}})
}

func (a *App) coreWatchSnapshot(c *fiber.Ctx, id, filter string, discardSys bool) error {
	cfg, err := a.nui.ConnRepo.GetById(id)
	if err != nil {
		return a.logAndFiberError(c, err, 404)
	}
	if a.coreWatches == nil {
		a.coreWatches = newCoreWatchHub()
	}
	return c.JSON(a.coreWatches.snapshot(id, filter, cfg, discardSys))
}

func sampleCore(ctx context.Context, conn *nats.Conn, filter string, listen time.Duration) *CoreCatalog {
	return sampleCoreLimited(ctx, conn, filter, listen, maxCoreSubjects, true)
}

func sampleCoreLimited(ctx context.Context, conn *nats.Conn, filter string, listen time.Duration, nameCap int, discardSys bool) *CoreCatalog {
	out := &CoreCatalog{
		Filter:   filter,
		ListenMs: int(listen / time.Millisecond),
		Subjects: []CoreSubject{},
	}
	asyncErr := make(chan error, 1)
	conn.SetErrorHandler(func(_ *nats.Conn, _ *nats.Subscription, err error) {
		if err == nil {
			return
		}
		select {
		case asyncErr <- err:
		default:
		}
	})

	ch := make(chan *nats.Msg, coreSubscribeBuffer)
	sub, err := conn.ChanSubscribe(filter, ch)
	if err != nil {
		out.Error = coreUserError(err)
		return out
	}
	_ = sub.SetPendingLimits(corePendingMsgs, corePendingBytes)

	var unsubOnce sync.Once
	unsubscribe := func() {
		unsubOnce.Do(func() { _ = sub.Unsubscribe() })
	}
	defer unsubscribe()

	stop := make(chan struct{})
	go func() {
		select {
		case <-ctx.Done():
			unsubscribe()
		case <-stop:
		}
	}()
	defer close(stop)

	if err := conn.Flush(); err != nil {
		out.Error = coreUserError(err)
		return out
	}
	if err := conn.LastError(); err != nil {
		out.Error = coreUserError(err)
		return out
	}

	hits := map[string]*CoreSubject{}
	var extraDropped atomic.Int64
	timer := time.NewTimer(listen)
	defer timer.Stop()

	finish := func() {
		pendingDropped, err := sub.Dropped()
		unsubscribe()
		dropped := int(extraDropped.Load())
		if err == nil && pendingDropped > 0 {
			dropped += pendingDropped
		}
		out.Dropped = dropped
		out.Heard = len(hits)
		out.Subjects = make([]CoreSubject, 0, len(hits))
		for _, hit := range hits {
			out.Subjects = append(out.Subjects, *hit)
		}
		sortCoreSubjects(out.Subjects)
	}

	record := func(msg *nats.Msg) {
		if msg == nil {
			return
		}
		if hideInternal(discardSys, msg.Subject) {
			return
		}
		hit, exists := hits[msg.Subject]
		if !exists {
			if nameCap > 0 && len(hits) >= nameCap {
				out.Truncated = true
				extraDropped.Add(1)
				return
			}
			hit = &CoreSubject{Subject: msg.Subject}
			hits[msg.Subject] = hit
		}
		hit.Count++
	}

	for {
		select {
		case err := <-asyncErr:
			out.Error = coreUserError(err)
			finish()
			return out
		case <-ctx.Done():
			if out.Error == "" && errors.Is(ctx.Err(), context.DeadlineExceeded) {
				out.Error = "timed out"
			}
			finish()
			return out
		case <-timer.C:
			finish()
			return out
		case msg, ok := <-ch:
			if !ok {
				finish()
				return out
			}
			record(msg)
		}
	}
}

func coreUserError(err error) string {
	if err == nil {
		return ""
	}
	if errors.Is(err, context.Canceled) || errors.Is(err, context.DeadlineExceeded) {
		return "timed out"
	}
	s := strings.ToLower(err.Error())
	if strings.Contains(s, "permission") || strings.Contains(s, "authorization") || strings.Contains(s, "not permitted") {
		return "not allowed"
	}
	return err.Error()
}
