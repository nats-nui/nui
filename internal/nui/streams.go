package nui

import (
	"context"
	"errors"
	"fmt"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
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

	// Stream has messages, ,so proceed with consumer configuration based on query parameters
	config := jetstream.ConsumerConfig{
		DeliverPolicy: jetstream.DeliverByStartSequencePolicy,
		MemoryStorage: true,
		Name:          "nui-" + uuid.NewString(),
	}

	subjects := strings.Split(c.Query("subjects"), ",")
	if len(subjects) > 0 && subjects[0] != "" {
		if len(subjects) == 1 {
			config.FilterSubject = subjects[0]
		} else {
			config.FilterSubjects = subjects
		}
	}
	interval, err := strconv.Atoi(c.Query("interval"))
	if err != nil {
		interval = 25
	}
	// batch is the absolute value of the interval
	batch := interval
	if batch < 0 {
		batch = -batch
	}

	var msgCount int
	msgs := make([]ws.NatsMsg, 0, batch)

	timeStr := c.Query("start_time")
	if timeStr != "" {
		config.DeliverPolicy = jetstream.DeliverByStartTimePolicy
		t, err := time.Parse(time.RFC3339, timeStr)
		if err != nil {
			return a.logAndFiberError(c, err, 422)
		}
		config.OptStartTime = &t
		msgCount = batch
	} else {
		querySeq, err := strconv.Atoi(c.Query("seq_start"))
		if err != nil {
			info, err := stream.Info(c.Context())
			if err != nil {
				return a.logAndFiberError(c, err, 500)
			}
			if interval > 0 {
				querySeq = int(info.State.FirstSeq)
			} else {
				querySeq = int(info.State.LastSeq)
			}
			querySeq = max(querySeq, 1)
		}
		var seekFromSeq uint64
		seekFromSeq, msgCount, err = findSeekSeq(c.Context(), stream, info, config, querySeq, interval)
		if err != nil {
			return a.logAndFiberError(c, err, 500)
		}
		if msgCount == 0 {
			return c.JSON(msgs)
		}
		config.OptStartSeq = seekFromSeq
	}

	msgs, err = a.fetchMessages(c, err, stream, config, batch, msgs, msgCount)
	if err != nil {
		return a.logAndFiberError(c, err, 500)
	}
	return c.JSON(msgs)
}

func (a *App) fetchMessages(c *fiber.Ctx, err error, stream jetstream.Stream, config jetstream.ConsumerConfig, batch int, msgs []ws.NatsMsg, msgCount int) ([]ws.NatsMsg, error) {
	consumer, err := stream.CreateOrUpdateConsumer(c.Context(), config)
	if err != nil {
		return nil, err
	}
	msgBatch, err := consumer.FetchNoWait(batch)
	if err != nil {
		return nil, err
	}
	for msg := range msgBatch.Messages() {
		if len(msgs) == msgCount {
			break
		}
		if msgBatch.Error() != nil {
			return nil, fmt.Errorf("failed to fetch message: %w", msgBatch.Error())
		}
		metadata, err := msg.Metadata()
		if err != nil {
			return nil, err
		}
		msgs = append(msgs, ws.NatsMsg{
			Subject:    msg.Subject(),
			SeqNum:     metadata.Sequence.Stream,
			ReceivedAt: metadata.Timestamp,
			Payload:    msg.Data(),
			Headers:    msg.Headers(),
		})
	}
	_ = stream.DeleteConsumer(c.Context(), config.Name)
	return msgs, nil
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

func findSeekSeq(ctx context.Context, stream jetstream.Stream, info *jetstream.StreamInfo, consumerConfig jetstream.ConsumerConfig, startSeq int, interval int) (uint64, int, error) {
	if interval >= 0 {
		return uint64(startSeq), interval, nil
	}

	if uint64(startSeq) < info.State.FirstSeq {
		return info.State.FirstSeq, 0, nil
	}
	intervalMultiplier := 1
	firstSeq := startSeq
	for {
		batch := min(10000, -interval*intervalMultiplier)
		firstSeq -= batch - 1
		if firstSeq <= 1 || uint64(firstSeq) <= info.State.FirstSeq {
			return info.State.FirstSeq, int(info.State.FirstSeq - uint64(firstSeq)), nil
		}
		if uint64(firstSeq) == info.State.FirstSeq {
			return info.State.FirstSeq, 1, nil
		}
		consumerConfig.OptStartSeq = uint64(firstSeq)
		consumerConfig.HeadersOnly = true
		consumer, err := stream.CreateConsumer(ctx, consumerConfig)
		if err != nil {
			return 0, 0, err
		}
		msgBatch, err := consumer.FetchNoWait(batch)
		if err != nil {
			return 0, 0, err
		}
		neededSeq, msgsCount, done, err := findSeqInBatch(msgBatch, startSeq, batch)
		err = stream.DeleteConsumer(context.Background(), consumerConfig.Name)
		if err != nil {
			jsErr, ok := err.(jetstream.JetStreamError)
			if !ok || jsErr.APIError().Code != 404 {
				return 0, 0, nil
			}
		}
		if done {
			return neededSeq, msgsCount, nil
		}
	}
}

func findSeqInBatch(msgBatch jetstream.MessageBatch, startSeq int, batch int) (uint64, int, bool, error) {
	neededSeq := uint64(0)
	msgsCount := 0
	for msg := range msgBatch.Messages() {
		if msgBatch.Error() != nil {
			return 0, 0, false, msgBatch.Error()
		}
		msgsCount++
		metadata, err := msg.Metadata()
		if err != nil {
			return 0, 0, false, err
		}
		if neededSeq == 0 {
			neededSeq = metadata.Sequence.Stream
		}
		if metadata.Sequence.Stream > uint64(startSeq) {
			return 0, 0, false, nil
		}
		if msgsCount >= batch {
			return neededSeq, msgsCount, true, nil
		}
	}
	return 0, 0, false, nil
}
