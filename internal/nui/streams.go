package nui

import (
	"context"
	"errors"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/nats-io/nats.go/jetstream"
	"github.com/nats-nui/nui/internal/ws"
	"strconv"
	"strings"
)

func (a *App) handleIndexStreams(c *fiber.Ctx) error {
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

func (a *App) handleShowStream(c *fiber.Ctx) error {
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

func (a *App) handleCreateStream(c *fiber.Ctx) error {
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

func (a *App) handleUpdateStream(c *fiber.Ctx) error {
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

func (a *App) handleDeleteStream(c *fiber.Ctx) error {
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

func (a *App) handlePurgeStream(c *fiber.Ctx) error {
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
				options = append(options, jetstream.WithPurgeSequence(value.(uint64)))
			case "keep":
				options = append(options, jetstream.WithPurgeKeep(value.(uint64)))
			case "subject":
				options = append(options, jetstream.WithPurgeSubject(value.(string)))
			}
		}
	}
	err = stream.Purge(c.Context(), options...)
	if err != nil {
		return a.logAndFiberError(c, err, 500)
	}
	return c.SendStatus(200)
}

func (a *App) handleSealStream(c *fiber.Ctx) error {
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

func (a *App) handleIndexStreamMessages(c *fiber.Ctx) error {
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
	querySeq, err := strconv.Atoi(c.Query("seq_start"))
	if err != nil {
		info, err := stream.Info(c.Context())
		if err != nil {
			return a.logAndFiberError(c, err, 500)
		}
		querySeq = int(info.State.FirstSeq)
	}
	// batch is the absolute value of the interval
	batch := interval
	if batch < 0 {
		batch = -batch
	}

	seekFromSeq, err := findSeekSeq(c.Context(), stream, config, querySeq, interval)
	if err != nil {
		return a.logAndFiberError(c, err, 500)
	}
	config.OptStartSeq = seekFromSeq
	consumer, err := stream.CreateOrUpdateConsumer(c.Context(), config)
	if err != nil {
		return a.logAndFiberError(c, err, 500)
	}
	msgBatch, err := consumer.FetchNoWait(batch)
	if err != nil {
		return a.logAndFiberError(c, err, 500)
	}
	msgs := make([]ws.NatsMsg, 0, batch)
	for msg := range msgBatch.Messages() {
		if msgBatch.Error() != nil {
			return c.Status(500).JSON(msgBatch.Error().Error())
		}
		metadata, err := msg.Metadata()
		if err != nil {
			return a.logAndFiberError(c, err, 500)
		}
		msgs = append(msgs, ws.NatsMsg{
			Subject: msg.Subject(),
			SeqNum:  metadata.Sequence.Stream,
			Payload: msg.Data(),
		})
	}
	_ = stream.DeleteConsumer(c.Context(), config.Name)
	return c.JSON(msgs)
}

func (a *App) handleDeleteStreamMessage(c *fiber.Ctx) error {
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

func findSeekSeq(ctx context.Context, stream jetstream.Stream, consumerConfig jetstream.ConsumerConfig, startSeq int, interval int) (uint64, error) {
	if interval >= 0 {
		return uint64(startSeq), nil
	}
	intervalMultiplier := 1
	fistSeq := startSeq
	for {
		batch := min(10000, -interval*intervalMultiplier)
		fistSeq -= batch
		if fistSeq <= 1 {
			return 1, nil
		}
		consumerConfig.OptStartSeq = uint64(fistSeq)
		consumerConfig.HeadersOnly = true
		consumer, err := stream.CreateConsumer(ctx, consumerConfig)
		if err != nil {
			return 0, err
		}
		msgBatch, err := consumer.FetchNoWait(batch)
		if err != nil {
			return 0, err
		}
		neededSeq, done, err := findSeqInBatch(msgBatch, startSeq, batch)
		err = stream.DeleteConsumer(context.Background(), consumerConfig.Name)
		if err != nil {
			jsErr, ok := err.(jetstream.JetStreamError)
			if !ok || jsErr.APIError().Code != 404 {
				return 0, nil
			}
		}
		if done {
			return neededSeq, nil
		}
	}
}

func findSeqInBatch(msgBatch jetstream.MessageBatch, startSeq int, batch int) (uint64, bool, error) {
	neededSeq := uint64(0)
	msgsCount := 0
	for msg := range msgBatch.Messages() {
		if msgBatch.Error() != nil {
			return 0, false, msgBatch.Error()
		}
		msgsCount++
		metadata, err := msg.Metadata()
		if err != nil {
			return 0, false, err
		}
		if neededSeq == 0 {
			neededSeq = metadata.Sequence.Stream
		}
		if metadata.Sequence.Stream > uint64(startSeq) {
			return 0, false, nil
		}
		if msgsCount >= batch {
			return neededSeq, true, nil
		}
	}
	return 0, false, nil
}
