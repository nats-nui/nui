package nui

import (
	"context"
	"errors"
	"strings"
	"sync"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/nats-io/nats.go"
	"github.com/nats-nui/nui/internal/connection"
)

// Without a filter, GET only reads the current live snapshot.
func (a *App) HandleCoreListen(c *fiber.Ctx) error {
	if c.Params("id") == "" {
		return c.Status(422).JSON("id is required")
	}
	id := strings.Clone(c.Params("id"))
	watch := c.QueryBool("watch", false)
	discardSys := c.QueryBool("discard_sys", true)
	filter := strings.Clone(normalizeListenFilter(c.Query("filter")))

	if watch {
		if err := validateListenFilter(filter); err != nil {
			return c.Status(422).JSON(NewError(err.Error()))
		}
		return a.coreWatchSnapshot(c, id, filter, discardSys)
	}
	if filter == "" && c.Query("listen_ms") == "" && a.coreWatches != nil {
		if out := a.coreWatches.read(id, c.Query("session")); out != nil {
			return c.JSON(out)
		}
		return c.JSON(&CoreCatalog{Subjects: []CoreSubject{}})
	}
	if err := validateListenFilter(filter); err != nil {
		return c.Status(422).JSON(NewError(err.Error()))
	}
	listenMs := c.QueryInt("listen_ms", defaultListenMs)
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
		a.coreWatches.stopSession(c.Params("id"), c.Query("session"))
	}
	return c.JSON(&CoreCatalog{Subjects: []CoreSubject{}})
}

func (a *App) coreWatchSnapshot(c *fiber.Ctx, id, filter string, discardSys bool) error {
	cfg, err := a.nui.ConnRepo.GetById(id)
	if err != nil {
		return a.logAndFiberError(c, err, 404)
	}
	return c.JSON(a.coreWatches.snapshot(id, filter, cfg, discardSys, strings.Clone(c.Query("session"))))
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
	conn.SetClosedHandler(func(_ *nats.Conn) {
		select {
		case asyncErr <- nats.ErrConnectionClosed:
		default:
		}
	})

	ch := make(chan string, coreSubscribeBuffer)
	sub, err := conn.Subscribe(filter, func(msg *nats.Msg) {
		if hideInternal(discardSys, msg.Subject) {
			return
		}
		select {
		case ch <- msg.Subject:
		default:
			select {
			case asyncErr <- nats.ErrSlowConsumer:
			default:
			}
		}
	})
	if err != nil {
		out.Error = coreUserError(err)
		return out
	}
	if err := sub.SetPendingLimits(corePendingMsgs, corePendingBytes); err != nil {
		_ = sub.Unsubscribe()
		out.Error = coreUserError(err)
		return out
	}

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

	flushCtx, cancel := context.WithTimeout(ctx, 2*time.Second)
	defer cancel()
	if err := conn.FlushWithContext(flushCtx); err != nil {
		out.Error = coreUserError(err)
		return out
	}
	if err := conn.LastError(); err != nil {
		out.Error = coreUserError(err)
		return out
	}

	hits := map[string]*CoreSubject{}
	extraDropped := 0
	timer := time.NewTimer(listen)
	defer timer.Stop()

	finish := func() {
		pendingDropped, err := sub.Dropped()
		unsubscribe()
		dropped := extraDropped
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

	record := func(subject string) {
		hit, exists := hits[subject]
		if !exists {
			if nameCap > 0 && len(hits) >= nameCap {
				out.Truncated = true
				extraDropped++
				return
			}
			hit = &CoreSubject{Subject: subject}
			hits[subject] = hit
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
			if out.Truncated {
				finish()
				return out
			}
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
	if errors.Is(err, nats.ErrSlowConsumer) {
		return "too much traffic"
	}
	if errors.Is(err, nats.ErrConnectionClosed) {
		return "connection closed"
	}
	s := strings.ToLower(err.Error())
	if strings.Contains(s, "permission") || strings.Contains(s, "authorization") || strings.Contains(s, "not permitted") {
		return "not allowed"
	}
	return err.Error()
}
