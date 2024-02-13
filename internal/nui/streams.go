package nui

import (
	"errors"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/nats-io/nats.go/jetstream"
	"github.com/pricelessrabbit/nui/internal/ws"
	"math"
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
	return c.JSON(info.Config)
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

	batch, err := strconv.Atoi(c.Query("interval"))
	if err != nil {
		batch = 25
	}

	seq, err := strconv.Atoi(c.Query("seq_start"))
	if err != nil {
		info, err := stream.Info(c.Context())
		if err != nil {
			return a.logAndFiberError(c, err, 500)
		}
		seq = int(math.Min(1, float64(info.State.LastSeq-uint64(batch))))
	}
	config.OptStartSeq = uint64(seq)
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
