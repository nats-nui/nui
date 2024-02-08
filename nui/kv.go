package nui

import (
	"errors"
	"github.com/gofiber/fiber/v2"
	"github.com/nats-io/nats.go/jetstream"
	"time"
)

type BucketState struct {
	Bucket       string        `json:"bucket"`
	Values       uint64        `json:"values"`
	History      int64         `json:"history"`
	TTL          time.Duration `json:"ttl"`
	BackingStore string        `json:"backingStore"`
	Bytes        uint64        `json:"bytes"`
	Compressed   bool          `json:"compressed"`
}

func NewBucketState(kvs jetstream.KeyValueStatus) BucketState {
	return BucketState{
		Bucket:       kvs.Bucket(),
		Values:       kvs.Values(),
		History:      kvs.History(),
		TTL:          kvs.TTL(),
		BackingStore: kvs.BackingStore(),
		Bytes:        kvs.Bytes(),
		Compressed:   kvs.IsCompressed(),
	}
}

type KevValueEntry struct {
	Key        string          `json:"key"`
	Payload    []byte          `json:"payload"`
	LastUpdate LastUpdate      `json:"last_update"`
	Operation  string          `json:"operation"`
	Revision   uint64          `json:"revision"`
	IsDeleted  bool            `json:"is_deleted"`
	History    []KevValueEntry `json:"history"`
}

func NewKeyValueEntry(entry jetstream.KeyValueEntry) KevValueEntry {
	return KevValueEntry{
		Key:        entry.Key(),
		Payload:    entry.Value(),
		LastUpdate: LastUpdate(entry.Created()),
		Operation:  entry.Operation().String(),
		Revision:   entry.Revision(),
		IsDeleted:  entry.Operation() == jetstream.KeyValueDelete,
	}
}

type LastUpdate time.Time

func (l LastUpdate) MarshalJSON() ([]byte, error) {
	return []byte(`"` + time.Time(l).Format(time.RFC3339) + `"`), nil
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
	var statuses []BucketState
	for status := range kvLister.Status() {
		if kvLister.Error() != nil {
			return a.logAndFiberError(c, err, 500)
		}
		statuses = append(statuses, NewBucketState(status))
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
		return a.logAndFiberError(c, err, 500)
	}
	return c.JSON(NewBucketState(status))
}

func (a *App) handleCreateBucket(c *fiber.Ctx) error {
	js, ok, err := a.jsOrFail(c)
	if !ok {
		return err
	}
	bucketConfig := jetstream.KeyValueConfig{}
	if err := c.BodyParser(&bucketConfig); err != nil {
		return a.logAndFiberError(c, err, 422)
	}
	kv, err := js.CreateKeyValue(c.Context(), bucketConfig)
	if err != nil {
		return a.logAndFiberError(c, err, 500)
	}
	status, err := kv.Status(c.Context())
	if err != nil {
		return a.logAndFiberError(c, err, 500)
	}
	return c.JSON(NewBucketState(status))
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
		return a.logAndFiberError(c, err, 500)
	}
	return c.SendStatus(200)
}
func (a *App) handleIndexKeys(c *fiber.Ctx) error {
	kv, ok, err := a.bucketOrFail(c, c.Params("bucket"))
	if !ok {
		return err
	}
	watcher, err := kv.WatchAll(c.Context(), jetstream.IgnoreDeletes(), jetstream.MetaOnly())

	var keysData []KevValueEntry

watch:
	for {
		select {
		case <-c.Context().Done():
			break watch
		case e := <-watcher.Updates():
			if e == nil {
				break watch
			}
			isDeleted := e.Operation() != jetstream.KeyValuePut
			keysData = append(keysData, KevValueEntry{
				Key:        e.Key(),
				Payload:    nil,
				LastUpdate: LastUpdate(e.Created()),
				Operation:  e.Operation().String(),
				Revision:   e.Revision(),
				IsDeleted:  isDeleted,
			})
		}
	}
	_ = watcher.Stop()
	if err != nil {
		return a.logAndFiberError(c, err, 500)
	}
	return c.JSON(keysData)
}

func (a *App) handleShowKey(c *fiber.Ctx) error {
	kv, ok, err := a.bucketOrFail(c, c.Params("bucket"))
	if !ok {
		return err
	}
	keyEntry, err := kv.Get(c.Context(), c.Params("key"))
	if err != nil {
		if errors.Is(err, jetstream.ErrKeyNotFound) {
			return a.logAndFiberError(c, err, 404)
		}
		return a.logAndFiberError(c, err, 500)
	}
	history, err := kv.History(c.Context(), keyEntry.Key(), jetstream.IgnoreDeletes())
	if err != nil {
		return a.logAndFiberError(c, err, 500)
	}
	var historyData []KevValueEntry
	for _, entry := range history {
		historyData = append(historyData, NewKeyValueEntry(entry))
	}

	data := NewKeyValueEntry(keyEntry)
	data.History = historyData

	return c.JSON(data)
}

type PutRequest struct {
	Payload []byte `json:"payload"`
}

func (a *App) handlePutKey(c *fiber.Ctx) error {
	kv, ok, err := a.bucketOrFail(c, c.Params("bucket"))
	if !ok {
		return err
	}
	key := c.Params("key")
	if key == "" {
		return c.Status(422).JSON("key is required")
	}
	req := &PutRequest{}
	err = c.BodyParser(req)
	if err != nil {
		return a.logAndFiberError(c, err, 422)
	}
	rev, err := kv.Put(c.Context(), key, req.Payload)
	if err != nil {
		return a.logAndFiberError(c, err, 500)
	}
	kvEntry, err := kv.GetRevision(c.Context(), key, rev)
	if err != nil {
		return a.logAndFiberError(c, err, 500)
	}

	kvResp := NewKeyValueEntry(kvEntry)
	return c.JSON(&kvResp)
}

func (a *App) handleDeleteKey(c *fiber.Ctx) error {
	kv, ok, err := a.bucketOrFail(c, c.Params("bucket"))
	if !ok {
		return err
	}
	err = kv.Delete(c.Context(), c.Params("key"))
	if err != nil {
		if errors.Is(err, jetstream.ErrKeyNotFound) {
			return a.logAndFiberError(c, err, 404)
		}
		return a.logAndFiberError(c, err, 500)
	}
	return c.SendStatus(204)
}
