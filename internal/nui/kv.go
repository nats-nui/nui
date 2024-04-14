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

type BucketConfig struct {
	Bucket       string                    `json:"bucket"`
	Description  string                    `json:"description"`
	MaxValueSize int32                     `json:"max_value_size"`
	History      uint8                     `json:"history"`
	TTL          time.Duration             `json:"ttl"`
	MaxBytes     int64                     `json:"max_bytes"`
	Storage      jetstream.StorageType     `json:"storage"`
	Replicas     int                       `json:"replicas"`
	Placement    *jetstream.Placement      `json:"placement"`
	RePublish    *jetstream.RePublish      `json:"re_publish"`
	Mirror       *jetstream.StreamSource   `json:"mirror"`
	Sources      []*jetstream.StreamSource `json:"sources"`

	// Enable underlying stream compression.
	// NOTE: Compression is supported for nats-server 2.10.0+
	Compression bool `json:"compression"`
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
	bucketConfig := BucketConfig{}
	if err := c.BodyParser(&bucketConfig); err != nil {
		return a.logAndFiberError(c, err, 422)
	}
	jestreamConfig := a.parseBucketConfig(bucketConfig)
	kv, err := js.CreateKeyValue(c.Context(), jestreamConfig)
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
	watcher, err := kv.WatchAll(c.Context(), jetstream.MetaOnly())

	keysData := make([]KevValueEntry, 0)

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
	key := c.Params("key")

	history, err := kv.History(c.Context(), key)
	if err != nil {
		if errors.Is(err, jetstream.ErrKeyNotFound) {
			return a.logAndFiberError(c, err, 404)
		}
		return a.logAndFiberError(c, err, 500)
	}
	if err != nil {
		return a.logAndFiberError(c, err, 500)
	}
	var historyData []KevValueEntry
	for _, entry := range history {
		historyData = append(historyData, NewKeyValueEntry(entry))
	}

	data := NewKeyValueEntry(history[len(history)-1])
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

func (a *App) handlePurgeKey(c *fiber.Ctx) error {
	kv, ok, err := a.bucketOrFail(c, c.Params("bucket"))
	if !ok {
		return err
	}
	err = kv.Purge(c.Context(), c.Params("key"))
	if err != nil {
		if errors.Is(err, jetstream.ErrKeyNotFound) {
			return a.logAndFiberError(c, err, 404)
		}
		return a.logAndFiberError(c, err, 500)
	}
	return c.SendStatus(204)
}

func (a *App) parseBucketConfig(bc BucketConfig) jetstream.KeyValueConfig {
	return jetstream.KeyValueConfig{
		Bucket:       bc.Bucket,
		Description:  bc.Description,
		MaxValueSize: bc.MaxValueSize,
		History:      bc.History,
		TTL:          bc.TTL,
		MaxBytes:     bc.MaxBytes,
		Storage:      bc.Storage,
		Replicas:     bc.Replicas,
		Placement:    bc.Placement,
		RePublish:    bc.RePublish,
		Mirror:       bc.Mirror,
		Sources:      bc.Sources,
		Compression:  bc.Compression,
	}
}
