package nui

import (
	"errors"
	"github.com/gofiber/fiber/v2"
	"github.com/nats-io/nats.go/jetstream"
	"strings"
	"time"
)

const KV_STREAM_PREFIX = "KV_"

type BucketState struct {
	Bucket       string                    `json:"bucket"`
	Values       uint64                    `json:"values"`
	History      int64                     `json:"history"`
	TTL          time.Duration             `json:"ttl"`
	BackingStore string                    `json:"backing_store"`
	Bytes        uint64                    `json:"bytes"`
	Compressed   bool                      `json:"compressed"`
	Config       *jetstream.KeyValueConfig `json:"config"`
}

func NewBucketState(kvs jetstream.KeyValueStatus, config *jetstream.KeyValueConfig) BucketState {
	return BucketState{
		Bucket:       kvs.Bucket(),
		Values:       kvs.Values(),
		History:      kvs.History(),
		TTL:          kvs.TTL(),
		BackingStore: kvs.BackingStore(),
		Bytes:        kvs.Bytes(),
		Compressed:   kvs.IsCompressed(),
		Config:       config,
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

func (a *App) HandleIndexBuckets(c *fiber.Ctx) error {
	js, ok, err := a.jsOrFail(c)
	if !ok {
		return err
	}
	kvLister := js.KeyValueStores(c.Context())
	var statuses []BucketState
	for status := range kvLister.Status() {
		if kvLister.Error() != nil {
			return a.logAndFiberError(c, err, 500)
		}
		statuses = append(statuses, NewBucketState(status, nil))
	}
	return c.JSON(statuses)
}

func (a *App) HandleShowBucket(c *fiber.Ctx) error {
	kv, ok, err := a.bucketOrFail(c, c.Params("bucket"))
	if !ok {
		return err
	}
	status, err := kv.Status(c.Context())
	if err != nil {
		return a.logAndFiberError(c, err, 500)
	}

	// retrieve config from the related stream cause no direct api available for get bucket config
	stream, ok, err := a.streamOrFail(c, KV_STREAM_PREFIX+c.Params("bucket"))
	if !ok {
		return a.logAndFiberError(c, err, 500)
	}
	streamInfo, err := stream.Info(c.Context())
	if err != nil {
		return a.logAndFiberError(c, err, 500)
	}
	bucketConfig := parseStreamConfigToKeyValueConfig(streamInfo.Config)

	return c.JSON(NewBucketState(status, &bucketConfig))
}

func parseStreamConfigToKeyValueConfig(scfg jetstream.StreamConfig) jetstream.KeyValueConfig {
	return jetstream.KeyValueConfig{
		Bucket:       strings.TrimPrefix(scfg.Name, KV_STREAM_PREFIX),
		Description:  scfg.Description,
		MaxValueSize: scfg.MaxMsgSize,
		History:      uint8(scfg.MaxMsgsPerSubject),
		TTL:          scfg.MaxAge,
		MaxBytes:     scfg.MaxBytes,
		Storage:      scfg.Storage,
		Replicas:     scfg.Replicas,
		Placement:    scfg.Placement,
		RePublish:    scfg.RePublish,
		Mirror:       scfg.Mirror,
		Sources:      scfg.Sources,
		Compression:  scfg.Compression != jetstream.NoCompression,
	}
}

func (a *App) HandleCreateBucket(c *fiber.Ctx) error {
	js, ok, err := a.jsOrFail(c)
	if !ok {
		return a.logAndFiberError(c, err, 500)
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
	return c.JSON(NewBucketState(status, &bucketConfig))
}

func (a *App) HandleUpdateBucket(c *fiber.Ctx) error {
	js, ok, err := a.jsOrFail(c)
	if !ok {
		return a.logAndFiberError(c, err, 500)
	}
	bucketName := c.Params("bucket")
	_, ok, err = a.bucketOrFail(c, bucketName)
	if !ok {
		return a.logAndFiberError(c, err, 500)
	}
	bucketConfig := jetstream.KeyValueConfig{}

	err = c.BodyParser(&bucketConfig)
	if err != nil {
		return a.logAndFiberError(c, err, 422)
	}
	bucketConfig.Bucket = bucketName
	kv, err := js.CreateOrUpdateKeyValue(c.Context(), bucketConfig)
	if err != nil {
		return a.logAndFiberError(c, err, 500)
	}
	status, err := kv.Status(c.Context())
	if err != nil {
		return a.logAndFiberError(c, err, 500)
	}
	return c.JSON(NewBucketState(status, &bucketConfig))
}

func (a *App) HandleDeleteBucket(c *fiber.Ctx) error {
	js, ok, err := a.jsOrFail(c)
	if !ok {
		return a.logAndFiberError(c, err, 500)
	}
	_, ok, err = a.bucketOrFail(c, c.Params("bucket"))
	if !ok {
		return a.logAndFiberError(c, err, 500)
	}
	err = js.DeleteKeyValue(c.Context(), c.Params("bucket"))
	if err != nil {
		return a.logAndFiberError(c, err, 500)
	}
	return c.SendStatus(200)
}

func (a *App) HandleIndexKeys(c *fiber.Ctx) error {
	kv, ok, err := a.bucketOrFail(c, c.Params("bucket"))
	if !ok {
		return a.logAndFiberError(c, err, 500)
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

func (a *App) HandlePurgeDeletedKeys(c *fiber.Ctx) error {
	kv, ok, err := a.bucketOrFail(c, c.Params("bucket"))
	if !ok {
		return a.logAndFiberError(c, err, 404)
	}
	err = kv.PurgeDeletes(c.Context(), jetstream.DeleteMarkersOlderThan(-1))
	if err != nil {
		return a.logAndFiberError(c, err, 500)
	}
	return c.SendStatus(204)
}

func (a *App) HandleShowKey(c *fiber.Ctx) error {
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
	Payload []byte        `json:"payload"`
	TTL     time.Duration `json:"ttl,omitempty"`
}

func (a *App) HandlePutKey(c *fiber.Ctx) error {
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
	entry, err := kv.Get(c.Context(), key)
	if err != nil && !errors.Is(err, jetstream.ErrKeyNotFound) {
		return a.logAndFiberError(c, err, 500)
	}
	rev := uint64(0)
	if err != nil {
		var options []jetstream.KVCreateOpt
		if req.TTL > 0 {
			options = append(options, jetstream.KeyTTL(req.TTL))
		}
		rev, err = kv.Create(c.Context(), key, req.Payload, options...)
	} else {
		rev, err = kv.Update(c.Context(), key, req.Payload, entry.Revision())
	}
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

func (a *App) HandleDeleteKey(c *fiber.Ctx) error {
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

func (a *App) HandlePurgeKey(c *fiber.Ctx) error {
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
