package nui

import (
	"errors"
	"github.com/gofiber/fiber/v2"
	"github.com/nats-io/nats.go/jetstream"
)

func (a *App) jsOrFail(c *fiber.Ctx) (jetstream.JetStream, bool, error) {
	conn, err := a.nui.ConnPool.Get(c.Params("connection_id"))
	if err != nil {
		return nil, false, a.logAndFiberError(c, err, 422)
	}
	js, err := jetstream.New(conn.Conn)
	if err != nil {
		return nil, false, a.logAndFiberError(c, err, 422)
	}
	return js, true, nil
}

func (a *App) bucketOrFail(c *fiber.Ctx, bucket string) (jetstream.KeyValue, bool, error) {
	js, ok, err := a.jsOrFail(c)
	if !ok {
		return nil, false, err
	}
	kv, err := js.KeyValue(c.Context(), bucket)
	if err != nil {
		if errors.Is(err, jetstream.ErrBucketNotFound) {
			return nil, false, a.logAndFiberError(c, err, 404)
		}
		return nil, false, a.logAndFiberError(c, err, 500)
	}
	return kv, true, nil
}

func (a *App) logAndFiberError(c *fiber.Ctx, err error, status int, args ...any) error {
	a.l.Error(err.Error(), args...)
	return c.Status(status).JSON(NewError(err.Error()))
}
