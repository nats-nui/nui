package nui

import (
	"cmp"
	"context"
	"sort"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/nats-io/nats.go"
	"github.com/nats-nui/nui/internal/connection"
)

func (a *App) HandleCoreListen(c *fiber.Ctx) error {
	if c.Params("id") == "" {
		return c.Status(422).JSON("id is required")
	}
	id := strings.Clone(c.Params("id"))
	discardSys := c.QueryBool("discard_sys", true)
	filter := strings.Clone(strings.TrimSpace(c.Query("filter")))

	if err := validateListenFilter(filter); err != nil {
		return c.Status(422).JSON(NewError(err.Error()))
	}
	listenMs := min(max(c.QueryInt("listen_ms", defaultListenMs), minListenMs), maxListenMs)

	budget := time.Duration(listenMs)*time.Millisecond + 2*time.Second
	ctx, cancel := context.WithTimeout(a.ctx, budget)
	defer cancel()
	ctx, release := a.coreListens.takeover(id, ctx)
	defer release()
	if err := ctx.Err(); err != nil {
		return c.JSON(&CoreCatalog{Filter: filter, ListenMs: listenMs, Subjects: []CoreSubject{}, Error: subjectDiscoveryError(err)})
	}

	cfg, err := a.nui.ConnRepo.GetById(id)
	if err != nil {
		return c.Status(404).JSON(NewError("connection could not be read"))
	}
	a.coreListens.setConfig(id, ctx, cfg)
	nc, err := connection.DialOnce(ctx, cfg)
	if err != nil {
		return c.Status(422).JSON(NewError(subjectDiscoveryError(err)))
	}
	defer nc.Close()

	out := sampleCoreLimited(ctx, nc, filter, time.Duration(listenMs)*time.Millisecond, maxCoreSubjects, discardSys)
	return c.JSON(out)
}

func sampleCoreLimited(ctx context.Context, conn *nats.Conn, filter string, listen time.Duration, nameCap int, discardSys bool) *CoreCatalog {
	out := &CoreCatalog{
		Filter:   filter,
		ListenMs: int(listen / time.Millisecond),
		Subjects: []CoreSubject{},
	}
	// A broker error can arrive while NextMsgWithContext waits on an empty subscription.
	ctx, stop := context.WithCancelCause(ctx)
	defer stop(nil)
	conn.SetErrorHandler(func(_ *nats.Conn, _ *nats.Subscription, err error) { stop(err) })
	sub, err := conn.SubscribeSync(filter)
	if err != nil {
		out.Error = subjectDiscoveryError(err)
		return out
	}
	defer sub.Unsubscribe()
	if err := sub.SetPendingLimits(conn.Opts.SubChanLen, corePendingBytes); err != nil {
		out.Error = subjectDiscoveryError(err)
		return out
	}

	flushCtx, cancel := context.WithTimeout(ctx, 2*time.Second)
	defer cancel()
	if err := conn.FlushWithContext(flushCtx); err != nil {
		out.Error = subjectDiscoveryError(cmp.Or(context.Cause(ctx), err))
		return out
	}
	if err := conn.LastError(); err != nil {
		out.Error = subjectDiscoveryError(err)
		return out
	}

	window, cancelWindow := context.WithTimeout(ctx, listen)
	defer cancelWindow()
	hits := make(map[string]int)
	for {
		msg, err := sub.NextMsgWithContext(window)
		if err != nil {
			if cause := context.Cause(ctx); cause != nil {
				out.Error = subjectDiscoveryError(cause)
			} else if window.Err() == nil {
				out.Error = subjectDiscoveryError(err)
			}
			break
		}
		if discardSys && isInternalSubject(msg.Subject) {
			continue
		}
		count, exists := hits[msg.Subject]
		if !exists && nameCap > 0 && len(hits) >= nameCap {
			out.Truncated = true
			out.Dropped++
			break
		}
		hits[msg.Subject] = count + 1
	}

	if dropped, err := sub.Dropped(); err == nil {
		out.Dropped += dropped
	}
	out.Heard = len(hits)
	out.Subjects = make([]CoreSubject, 0, len(hits))
	for subject, count := range hits {
		out.Subjects = append(out.Subjects, CoreSubject{Subject: subject, Count: count})
	}
	sort.Slice(out.Subjects, func(i, j int) bool { return out.Subjects[i].Subject < out.Subjects[j].Subject })
	return out
}
