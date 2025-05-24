package nui

import (
	"errors"
	"github.com/gofiber/fiber/v2"
	"github.com/nats-io/nats.go/jetstream"
	"time"
)

func (a *App) HandleIndexStreamConsumers(c *fiber.Ctx) error {
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
	listener := stream.ListConsumers(c.Context())
	infos := make([]*jetstream.ConsumerInfo, 0)
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

func (a *App) handleShowStreamConsumer(c *fiber.Ctx) error {
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
	consumer, err := stream.Consumer(c.Context(), c.Params("consumer_name"))
	if err != nil {
		return a.logAndFiberError(c, err, 422)
	}
	info, err := consumer.Info(c.Context())
	if err != nil {
		return a.logAndFiberError(c, err, 500)
	}
	return c.JSON(info)
}

func (a *App) handleCreateStreamConsumer(c *fiber.Ctx) error {
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
	var config jetstream.ConsumerConfig
	if err := c.BodyParser(&config); err != nil {
		return a.logAndFiberError(c, err, 422)
	}
	consumer, err := stream.CreateConsumer(c.Context(), config)
	if err != nil {
		return a.logAndFiberError(c, err, 422)
	}
	info, err := consumer.Info(c.Context())
	if err != nil {
		return a.logAndFiberError(c, err, 500)
	}
	return c.JSON(info)
}

func (a *App) handleUpdateStreamConsumer(c *fiber.Ctx) error {
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
	consumer, err := stream.Consumer(c.Context(), c.Params("consumer_name"))
	if err != nil {
		return a.logAndFiberError(c, err, 422)
	}
	var config jetstream.ConsumerConfig
	err = c.BodyParser(&config)
	if err != nil {
		return a.logAndFiberError(c, err, 422)
	}
	consumer, err = stream.UpdateConsumer(c.Context(), config)
	if err != nil {
		return a.logAndFiberError(c, err, 422)
	}
	info, err := consumer.Info(c.Context())
	if err != nil {
		return a.logAndFiberError(c, err, 500)
	}
	return c.JSON(info)
}

func (a *App) handleDeleteStreamConsumer(c *fiber.Ctx) error {
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
	_, err = stream.Consumer(c.Context(), c.Params("consumer_name"))
	if err != nil {
		return a.logAndFiberError(c, err, 422)
	}
	err = stream.DeleteConsumer(c.Context(), c.Params("consumer_name"))
	if err != nil {
		return a.logAndFiberError(c, err, 500)
	}
	return c.SendStatus(204)
}

func (a *App) handlePauseAndResumeConsumer(c *fiber.Ctx) error {
	ctx := c.Context()
	js, ok, err := a.jsOrFail(c)
	if !ok {
		return err
	}
	streamName := c.Params("stream_name")
	if streamName == "" {
		return a.logAndFiberError(c, errors.New("stream_name is required"), 422)
	}
	consumerName := c.Params("consumer_name")
	if consumerName == "" {
		return a.logAndFiberError(c, errors.New("consumer_name is required"), 422)
	}
	pauseReq := map[string]any{}
	err = c.BodyParser(&pauseReq)
	if err != nil {
		return a.logAndFiberError(c, err, 422)
	}
	action, ok := pauseReq["action"].(string)
	if !ok {
		return a.logAndFiberError(c, errors.New("action is required"), 422)
	}
	switch action {
	case "pause":
		pauseUntil, ok := pauseReq["pause_until"].(string)
		if !ok {
			return a.logAndFiberError(c, errors.New("pause_until field string required"), 422)
		}
		pauseTime, err := time.Parse(time.RFC3339, pauseUntil)
		if err != nil {
			return a.logAndFiberError(c, err, 422)
		}
		_, err = js.PauseConsumer(ctx, streamName, consumerName, pauseTime)
		if err != nil {
			return a.logAndFiberError(c, err, 500)
		}
	case "resume":
		_, err = js.ResumeConsumer(ctx, streamName, consumerName)
		if err != nil {
			return a.logAndFiberError(c, err, 500)
		}
	}
	consumer, err := js.Consumer(ctx, streamName, consumerName)
	if err != nil {
		return a.logAndFiberError(c, err, 500)
	}
	info, err := consumer.Info(ctx)
	if err != nil {
		return a.logAndFiberError(c, err, 500)
	}
	return c.JSON(info)
}
