package nui

import (
	"errors"
	"github.com/gofiber/fiber/v2"
	"github.com/nats-io/nats.go/jetstream"
)

func (a *App) handleIndexStreamConsumers(c *fiber.Ctx) error {
	conn, err := a.nui.ConnPool.Get(c.Params("connection_id"))
	if err != nil {
		return c.Status(404).JSON(err.Error())
	}
	js, err := jetstream.New(conn.Conn)
	if err != nil {
		return c.Status(422).JSON(err.Error())
	}
	streamName := c.Params("stream_name")
	if streamName == "" {
		return c.Status(422).JSON("stream_name is required")
	}
	stream, err := js.Stream(c.Context(), streamName)
	if err != nil {
		return c.Status(422).JSON(err.Error())
	}
	listener := stream.ListConsumers(c.Context())
	infos := make([]*jetstream.ConsumerInfo, 0)
	for {
		select {
		case info, ok := <-listener.Info():
			err := listener.Err()
			if err != nil {
				if !errors.Is(err, jetstream.ErrEndOfData) {
					return c.Status(500).JSON(err.Error())
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

func (a *App) handleShowStreamConsumer(c *fiber.Ctx) error {
	conn, err := a.nui.ConnPool.Get(c.Params("connection_id"))
	if err != nil {
		return c.Status(404).JSON(err.Error())
	}
	js, err := jetstream.New(conn.Conn)
	if err != nil {
		return c.Status(422).JSON(err.Error())
	}
	streamName := c.Params("stream_name")
	if streamName == "" {
		return c.Status(422).JSON("stream_name is required")
	}
	stream, err := js.Stream(c.Context(), streamName)
	if err != nil {
		return c.Status(422).JSON(err.Error())
	}
	consumer, err := stream.Consumer(c.Context(), c.Params("consumer_name"))
	if err != nil {
		return c.Status(422).JSON(err.Error())
	}
	info, err := consumer.Info(c.Context())
	if err != nil {
		return c.Status(500).JSON(err.Error())
	}
	return c.JSON(info)
}
