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

func (a *App) streamOrFail(c *fiber.Ctx, stream string) (jetstream.Stream, bool, error) {
	js, ok, err := a.jsOrFail(c)
	if !ok {
		return nil, false, err
	}
	str, err := js.Stream(c.Context(), stream)
	if err != nil {
		if errors.Is(err, jetstream.ErrStreamNotFound) {
			return nil, false, a.logAndFiberError(c, err, 404)
		}
		return nil, false, a.logAndFiberError(c, err, 500)
	}
	return str, true, nil
}

func (a *App) objStoreOrFail(c *fiber.Ctx, bucket string) (jetstream.ObjectStore, bool, error) {
	js, ok, err := a.jsOrFail(c)
	if !ok {
		return nil, false, err
	}
	objStore, err := js.ObjectStore(c.Context(), bucket)
	if err != nil {
		if errors.Is(err, jetstream.ErrBucketNotFound) {
			return nil, false, a.logAndFiberError(c, err, 404)
		}
		return nil, false, a.logAndFiberError(c, err, 500)
	}
	return objStore, true, nil
}

func (a *App) objInfoOrFail(c *fiber.Ctx, os jetstream.ObjectStore, object string, deleted bool) (*jetstream.ObjectInfo, bool, error) {
	opts := []jetstream.GetObjectInfoOpt{}
	if deleted {
		opts = append(opts, jetstream.GetObjectInfoShowDeleted())
	}
	objInfo, err := os.GetInfo(c.Context(), object, opts...)
	if err != nil {
		if errors.Is(err, jetstream.ErrObjectNotFound) {
			return nil, false, a.logAndFiberError(c, err, 404)
		}
		return nil, false, a.logAndFiberError(c, err, 500)
	}
	return objInfo, true, nil
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
