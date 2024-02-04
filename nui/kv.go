package nui

import (
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
	kv, ok, err := a.bucketOrFail(c, c.Params("bucket"))
	if !ok {
		return err
	}
	status, err := kv.Status(c.Context())
	if err != nil {
		return c.Status(500).JSON(err.Error())
	}
	return c.JSON(NewKeyValueStatusData(status))
}

func (a *App) handleCreateBucket(c *fiber.Ctx) error {
	js, ok, err := a.jsOrFail(c)
	if !ok {
		return err
	}
	bucketConfig := jetstream.KeyValueConfig{}
	if err := c.BodyParser(&bucketConfig); err != nil {
		return c.Status(422).JSON(err.Error())
	}
	kv, err := js.CreateKeyValue(c.Context(), bucketConfig)
	if err != nil {
		return c.Status(500).JSON(err.Error())
	}
	status, err := kv.Status(c.Context())
	if err != nil {
		return c.Status(500).JSON(err.Error())
	}
	return c.JSON(NewKeyValueStatusData(status))
}

func (a *App) handleDeleteBucket(c *fiber.Ctx) error {
	js, ok, err := a.jsOrFail(c)
	if !ok {
		return err
	}
	_, ok, err = a.bucketOrFail(c, c.Params("bucket"))
	if !ok {
		return err
	}
	err = js.DeleteKeyValue(c.Context(), c.Params("bucket"))
	if err != nil {
		return c.Status(500).JSON(err.Error())
	}
	return c.SendStatus(200)
}
