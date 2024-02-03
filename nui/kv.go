package nui

import (
	"errors"
	"github.com/gofiber/fiber/v2"
	"github.com/nats-io/nats.go/jetstream"
	"time"
)

type KeyValueStatusData struct {
	Bucket       string        `json:"bucket"`
	Values       uint64        `json:"values"`
	History      int64         `json:"history"`
	TTL          time.Duration `json:"ttl"`
	BackingStore string        `json:"backingStore"`
	Bytes        uint64        `json:"bytes"`
	Compressed   bool          `json:"compressed"`
}

func NewKeyValueStatusData(kvs jetstream.KeyValueStatus) KeyValueStatusData {
	return KeyValueStatusData{
		Bucket:       kvs.Bucket(),
		Values:       kvs.Values(),
		History:      kvs.History(),
		TTL:          kvs.TTL(),
		BackingStore: kvs.BackingStore(),
		Bytes:        kvs.Bytes(),
		Compressed:   kvs.IsCompressed(),
	}
}

func (a *App) handleIndexBuckets(c *fiber.Ctx) error {
	js, ok, err := a.jsOrFail(c)
	if !ok {
		return err
	}
	kvLister := js.KeyValueStores(c.Context())
	if err != nil {
		return err
	}
	var statuses []KeyValueStatusData
	for status := range kvLister.Status() {
		if kvLister.Error() != nil {
			return c.Status(500).JSON(err.Error())
		}
		statuses = append(statuses, NewKeyValueStatusData(status))
	}
	return c.JSON(statuses)
}

func (a *App) handleShowBucket(c *fiber.Ctx) error {
	js, ok, err := a.jsOrFail(c)
	if !ok {
		return err
	}
	bucket := c.Params("bucket")
	if bucket == "" {
		return c.Status(422).JSON("bucket is required")
	}
	kv, err := js.KeyValue(c.Context(), bucket)
	if err != nil {
		if errors.Is(err, jetstream.ErrBucketNotFound) {
			return c.Status(404).JSON(err.Error())
		}
		return c.Status(500).JSON(err.Error())
	}
	status, err := kv.Status(c.Context())
	if err != nil {
		return c.Status(500).JSON(err.Error())
	}
	return c.JSON(NewKeyValueStatusData(status))
}
