package nui

import (
	"context"
	"errors"
	"github.com/gofiber/fiber/v2"
	"github.com/nats-io/nats.go/jetstream"
	"github.com/nats-nui/nui/internal/ws"
	"strconv"
	"strings"
	"time"
)

func (a *App) HandleIndexStreams(c *fiber.Ctx) error {
	js, ok, err := a.jsOrFail(c)
	if !ok {
		return err
	}
	listener := js.ListStreams(c.Context())
	infos := make([]*jetstream.StreamInfo, 0)
	for {
		select {
		case info, ok := <-listener.Info():
			err := listener.Err()
			if err != nil {
				if !errors.Is(err, jetstream.ErrEndOfData) {
					return a.logAndFiberError(c, err, 500)
				}
				return c.JSON(infos)
			}
			if !ok {
				return c.JSON(infos)
			}
			infos = append(infos, info)
		}
	}
}

func (a *App) HandleShowStream(c *fiber.Ctx) error {
	streamName := c.Params("stream_name")
	if streamName == "" {
		return c.Status(422).JSON("stream_name is required")
	}
	js, ok, err := a.jsOrFail(c)
	if !ok {
		return err
	}
	stream, err := js.Stream(c.Context(), streamName)
	if err != nil {
		return a.logAndFiberError(c, err, 422)
	}
	info, err := stream.Info(c.Context(), jetstream.WithSubjectFilter(">"))
	if err != nil {
		return a.logAndFiberError(c, err, 500)
	}
	return c.JSON(info)
}

func (a *App) HandleCreateStream(c *fiber.Ctx) error {
	js, ok, err := a.jsOrFail(c)
	if !ok {
		return err
	}
	cfg := jetstream.StreamConfig{}
	err = c.BodyParser(&cfg)
	if err != nil {
		return a.logAndFiberError(c, err, 422)
	}
	stream, err := js.CreateStream(c.Context(), cfg)
	if err != nil {
		return a.logAndFiberError(c, err, 422)
	}
	info, err := stream.Info(c.Context())
	if err != nil {
		return a.logAndFiberError(c, err, 500)
	}
	return c.JSON(info)
}

func (a *App) HandleUpdateStream(c *fiber.Ctx) error {
	js, ok, err := a.jsOrFail(c)
	if !ok {
		return err
	}
	cfg := jetstream.StreamConfig{}
	err = c.BodyParser(&cfg)
	if err != nil {
		return a.logAndFiberError(c, err, 422)
	}
	stream, err := js.UpdateStream(c.Context(), cfg)
	if err != nil {
		return a.logAndFiberError(c, err, 422)
	}
	info, err := stream.Info(c.Context())
	if err != nil {
		return a.logAndFiberError(c, err, 500)
	}
	return c.JSON(info)
}

func (a *App) HandleDeleteStream(c *fiber.Ctx) error {
	js, ok, err := a.jsOrFail(c)
	if !ok {
		return err
	}
	streamName := c.Params("stream_name")
	if streamName == "" {
		return c.Status(422).JSON("stream_name is required")
	}
	_, err = js.Stream(c.Context(), streamName)
	if err != nil {
		return a.logAndFiberError(c, err, 422)
	}
	err = js.DeleteStream(c.Context(), streamName)
	if err != nil {
		return a.logAndFiberError(c, err, 500)
	}
	return c.SendStatus(200)
}

func (a *App) HandlePurgeStream(c *fiber.Ctx) error {
	js, ok, err := a.jsOrFail(c)
	if !ok {
		return err
	}
	streamName := c.Params("stream_name")
	if streamName == "" {
		return c.Status(422).JSON("stream_name is required")
	}
	stream, err := js.Stream(c.Context(), streamName)
	if err != nil {
		return a.logAndFiberError(c, err, 422)
	}
	var options []jetstream.StreamPurgeOpt
	reqOptions := &map[string]any{}

	err = c.BodyParser(&reqOptions)
	if err != nil {
		return a.logAndFiberError(c, err, 422)
	}

	if reqOptions != nil {
		for key, value := range *reqOptions {
			switch key {
			case "seq":
				if val, ok := value.(float64); ok && val >= 1 {
					options = append(options, jetstream.WithPurgeSequence(uint64(val)))
				}
			case "keep":
				if val, ok := value.(float64); ok && val >= 1 {
					options = append(options, jetstream.WithPurgeKeep(uint64(val)))
				}
			case "subject":
				if val, ok := value.(string); ok && val != "" {
					options = append(options, jetstream.WithPurgeSubject(val))
				}
			}
		}
	}
	err = stream.Purge(c.Context(), options...)
	if err != nil {
		return a.logAndFiberError(c, err, 500)
	}
	return c.SendStatus(204)
}

func (a *App) HandleSealStream(c *fiber.Ctx) error {
	//conn, err := a.nui.ConnPool.Get(c.Params("connection_id"))
	//if err != nil {
	//	return a.logAndFiberError(c,err,404)
	//}
	//js, err := jetstream.New(conn.Conn)
	//if err != nil {
	//	return a.logAndFiberError(c,err,422)
	//}
	//streamName := c.Params("stream_name")
	//if streamName == "" {
	//	return c.Status(422).JSON("stream_name is required")
	//}
	//stream, err := js.Stream(c.Context(), streamName)
	//if err != nil {
	//	return a.logAndFiberError(c,err,422)
	//}
	//
	//if err != nil {
	//	return a.logAndFiberError(c,err,500)
	//}
	return c.SendStatus(200)
}

func (a *App) HandleIndexStreamMessages(c *fiber.Ctx) error {
	js, ok, err := a.jsOrFail(c)
	if !ok {
		return err
	}
	streamName := c.Params("stream_name")
	if streamName == "" {
		return c.Status(422).JSON("stream_name is required")
	}
	stream, err := js.Stream(c.Context(), streamName)
	if err != nil {
		return a.logAndFiberError(c, err, 422)
	}

	info, err := stream.Info(c.Context())
	if err != nil {
		return a.logAndFiberError(c, err, 500)
	}

	// If there are no messages in the stream, return an empty array without further processing
	if info.State.Msgs == 0 {
		return c.JSON([]ws.NatsMsg{})
	}

	// Subjects to filter on. An empty filter matches every subject (">").
	subjects := strings.Split(c.Query("subjects"), ",")
	if len(subjects) == 0 || subjects[0] == "" {
		subjects = []string{">"}
	}

	// interval is the number of messages to return. A negative value walks
	// backwards, returning the |interval| messages ending at the start position.
	interval, err := strconv.Atoi(c.Query("interval"))
	if err != nil {
		interval = 25
	}
	limit := interval
	if limit < 0 {
		limit = -limit
	}
	if limit == 0 {
		return c.JSON([]ws.NatsMsg{})
	}

	// Messages are read directly from the stream through the Get Message API
	// (Stream.GetMsg), so no consumer is created. This is what allows browsing
	// WorkQueue and Interest streams, where extra or overlapping consumers are
	// forbidden by the server.
	var raw []*jetstream.RawStreamMsg
	if timeStr := c.Query("start_time"); timeStr != "" {
		t, err := time.Parse(time.RFC3339, timeStr)
		if err != nil {
			return a.logAndFiberError(c, err, 422)
		}
		startSeq, found, err := findSeqByTime(c.Context(), stream, info, t)
		if err != nil {
			return a.logAndFiberError(c, err, 500)
		}
		if !found {
			return c.JSON([]ws.NatsMsg{})
		}
		raw, err = collectForward(c.Context(), stream, startSeq, subjects, 0, limit)
		if err != nil {
			return a.logAndFiberError(c, err, 500)
		}
		return c.JSON(toNatsMsgs(raw))
	}

	querySeq, err := strconv.Atoi(c.Query("seq_start"))
	if err != nil {
		if interval > 0 {
			querySeq = int(info.State.FirstSeq)
		} else {
			querySeq = int(info.State.LastSeq)
		}
	}
	querySeq = max(querySeq, 1)

	if interval > 0 {
		raw, err = collectForward(c.Context(), stream, uint64(querySeq), subjects, 0, limit)
	} else {
		raw, err = collectBackward(c.Context(), stream, info, uint64(querySeq), subjects, limit)
	}
	if err != nil {
		return a.logAndFiberError(c, err, 500)
	}
	return c.JSON(toNatsMsgs(raw))
}

// getNextMsg fetches the first message with a sequence >= fromSeq whose subject
// matches subject (which may be a wildcard such as ">"). It relies on
// Stream.GetMsg, which reads directly from the stream and creates no consumer,
// so it works on any stream regardless of its retention policy. found is false
// when no matching message exists at or after fromSeq.
func getNextMsg(ctx context.Context, stream jetstream.Stream, fromSeq uint64, subject string) (*jetstream.RawStreamMsg, bool, error) {
	if fromSeq < 1 {
		fromSeq = 1
	}
	msg, err := stream.GetMsg(ctx, fromSeq, jetstream.WithGetMsgSubject(subject))
	if err != nil {
		if errors.Is(err, jetstream.ErrMsgNotFound) {
			return nil, false, nil
		}
		return nil, false, err
	}
	return msg, true, nil
}

// collectForward returns messages matching one of subjects, in ascending
// sequence order, starting at startSeq. When maxSeq > 0, messages beyond maxSeq
// are excluded. When limit > 0, at most limit messages are returned. Gaps left
// by deleted or expired messages are skipped naturally, since GetMsg jumps to
// the next existing message. Each subject is only re-queried once its cached
// candidate is consumed, so a single-subject browse costs one request per
// returned message.
func collectForward(ctx context.Context, stream jetstream.Stream, startSeq uint64, subjects []string, maxSeq uint64, limit int) ([]*jetstream.RawStreamMsg, error) {
	msgs := make([]*jetstream.RawStreamMsg, 0, limit)
	cursor := startSeq
	if cursor < 1 {
		cursor = 1
	}
	candidates := make(map[string]*jetstream.RawStreamMsg, len(subjects))
	exhausted := make(map[string]bool, len(subjects))
	for {
		if limit > 0 && len(msgs) >= limit {
			break
		}
		var best *jetstream.RawStreamMsg
		for _, subject := range subjects {
			if exhausted[subject] {
				continue
			}
			cand := candidates[subject]
			if cand == nil || cand.Sequence < cursor {
				m, found, err := getNextMsg(ctx, stream, cursor, subject)
				if err != nil {
					return nil, err
				}
				if !found {
					exhausted[subject] = true
					delete(candidates, subject)
					continue
				}
				cand = m
				candidates[subject] = m
			}
			if best == nil || cand.Sequence < best.Sequence {
				best = cand
			}
		}
		if best == nil {
			break
		}
		if maxSeq > 0 && best.Sequence > maxSeq {
			break
		}
		msgs = append(msgs, best)
		cursor = best.Sequence + 1
	}
	return msgs, nil
}

// collectBackward returns up to limit messages matching one of subjects whose
// sequence is <= startSeq, in ascending order (the tail of the match set). It
// scans forward inside a window that grows until enough matches are found or the
// beginning of the stream is reached, so it needs no consumer while still
// honouring gaps and subject filters.
func collectBackward(ctx context.Context, stream jetstream.Stream, info *jetstream.StreamInfo, startSeq uint64, subjects []string, limit int) ([]*jetstream.RawStreamMsg, error) {
	firstSeq := info.State.FirstSeq
	if startSeq < firstSeq {
		return []*jetstream.RawStreamMsg{}, nil
	}
	upper := startSeq
	if lastSeq := info.State.LastSeq; upper > lastSeq {
		upper = lastSeq
	}
	window := uint64(limit)
	for {
		lo := firstSeq
		if upper+1 > window {
			if cand := upper + 1 - window; cand > firstSeq {
				lo = cand
			}
		}
		msgs, err := collectForward(ctx, stream, lo, subjects, upper, 0)
		if err != nil {
			return nil, err
		}
		if len(msgs) >= limit {
			return msgs[len(msgs)-limit:], nil
		}
		if lo == firstSeq {
			return msgs, nil
		}
		window *= 2
	}
}

// findSeqByTime returns the sequence of the first message whose timestamp is at
// or after t, using a binary search over the stream sequences (message
// timestamps are monotonic with sequence). found is false when every message
// predates t. It reads messages directly and creates no consumer.
func findSeqByTime(ctx context.Context, stream jetstream.Stream, info *jetstream.StreamInfo, t time.Time) (uint64, bool, error) {
	lo, hi := info.State.FirstSeq, info.State.LastSeq
	if hi < lo {
		return 0, false, nil
	}
	var result uint64
	for lo <= hi {
		mid := lo + (hi-lo)/2
		msg, found, err := getNextMsg(ctx, stream, mid, ">")
		if err != nil {
			return 0, false, err
		}
		if !found {
			// No message exists at or after mid, so any match is lower.
			if mid == 0 {
				break
			}
			hi = mid - 1
			continue
		}
		if msg.Time.Before(t) {
			lo = msg.Sequence + 1
			continue
		}
		// This message is a match; look for an earlier one below mid.
		result = msg.Sequence
		if mid == 0 {
			break
		}
		hi = mid - 1
	}
	if result == 0 {
		return 0, false, nil
	}
	return result, true, nil
}

func toNatsMsgs(raw []*jetstream.RawStreamMsg) []ws.NatsMsg {
	msgs := make([]ws.NatsMsg, 0, len(raw))
	for _, m := range raw {
		msgs = append(msgs, ws.NatsMsg{
			Subject:    m.Subject,
			SeqNum:     m.Sequence,
			ReceivedAt: m.Time,
			Payload:    m.Data,
			Headers:    m.Header,
		})
	}
	return msgs
}

func (a *App) HandleDeleteStreamMessage(c *fiber.Ctx) error {
	js, ok, err := a.jsOrFail(c)
	if !ok {
		return err
	}
	streamName := c.Params("stream_name")
	if streamName == "" {
		return c.Status(422).JSON("stream_name is required")
	}
	stream, err := js.Stream(c.Context(), streamName)
	if err != nil {
		return a.logAndFiberError(c, err, 500)
	}
	seq, err := strconv.Atoi(c.Params("seq"))
	if err != nil {
		return a.logAndFiberError(c, err, 422)
	}
	if seq <= 0 {
		return c.Status(422).JSON("seq must be greater than 0")
	}
	err = stream.DeleteMsg(c.Context(), uint64(seq))
	if err != nil {
		if errors.Is(err, jetstream.ErrMsgNotFound) {
			return c.Status(404).JSON("message not found")
		}
		return a.logAndFiberError(c, err, 500)
	}
	return c.SendStatus(200)
}
