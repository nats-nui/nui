package nui

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/nats-io/nats.go/jetstream"
)

const OBJ_STREAM_PREFIX = "OBJ_"

type ObjStoreState struct {
	Bucket       string                       `json:"bucket"`
	Description  string                       `json:"description"`
	TTL          time.Duration                `json:"ttl"`
	StorageType  jetstream.StorageType        `json:"storage_type"`
	Replicas     int                          `json:"replicas"`
	Sealed       bool                         `json:"sealed"`
	Size         uint64                       `json:"size"`
	BackingStore string                       `json:"backing_store"`
	Metadata     map[string]string            `json:"metadata"`
	Compressed   bool                         `json:"compressed"`
	Config       *jetstream.ObjectStoreConfig `json:"config"`
}

func (a *App) NewObjectStoreState(status jetstream.ObjectStoreStatus) ObjStoreState {
	objStore := ObjStoreState{
		Bucket:       status.Bucket(),
		Description:  status.Description(),
		TTL:          status.TTL(),
		StorageType:  status.Storage(),
		Replicas:     status.Replicas(),
		Sealed:       status.Sealed(),
		Size:         status.Size(),
		BackingStore: status.BackingStore(),
		Metadata:     status.Metadata(),
		Compressed:   status.IsCompressed(),
		Config:       nil,
	}
	return objStore
}

func (a *App) HandleIndexObjStores(c *fiber.Ctx) error {
	js, ok, err := a.jsOrFail(c)
	if !ok {
		return err
	}
	objLister := js.ObjectStores(c.Context())
	var statuses []ObjStoreState
	for status := range objLister.Status() {
		if objLister.Error() != nil {
			return a.logAndFiberError(c, err, 500)
		}
		statuses = append(statuses, a.NewObjectStoreState(status))
	}
	return c.JSON(statuses)
}

func (a *App) HandleShowObjStore(c *fiber.Ctx) error {
	js, ok, err := a.jsOrFail(c)
	if !ok {
		return err
	}
	os, err := js.ObjectStore(c.Context(), c.Params("bucket"))
	if err != nil {
		return a.logAndFiberError(c, err, 500)
	}
	status, err := os.Status(c.Context())
	if err != nil {
		return a.logAndFiberError(c, err, 500)
	}
	objStore := a.NewObjectStoreState(status)
	// retrieve config from the related stream cause no direct api available for get obj store config
	stream, ok, err := a.streamOrFail(c, OBJ_STREAM_PREFIX+c.Params("bucket"))
	if !ok {
		return a.logAndFiberError(c, err, 500)
	}
	streamInfo, err := stream.Info(c.Context())
	if err != nil {
		return a.logAndFiberError(c, err, 500)
	}
	bucketConfig := parseStreamConfigToObjStoreConfig(status, streamInfo.Config)
	objStore.Config = bucketConfig
	return c.JSON(objStore)
}

func (a *App) HandleCreateObjStore(c *fiber.Ctx) error {
	js, ok, err := a.jsOrFail(c)
	if !ok {
		return a.logAndFiberError(c, err, 500)
	}
	objStoreConfig := jetstream.ObjectStoreConfig{}
	err = c.BodyParser(&objStoreConfig)
	if err != nil {
		return a.logAndFiberError(c, err, 422)
	}
	os, err := js.CreateObjectStore(c.Context(), objStoreConfig)
	if err != nil {
		return a.logAndFiberError(c, err, 500)
	}
	status, err := os.Status(c.Context())
	if err != nil {
		return a.logAndFiberError(c, err, 500)
	}
	return c.JSON(a.NewObjectStoreState(status))
}

func (a *App) HandleUpdateObjStore(c *fiber.Ctx) error {
	js, ok, err := a.jsOrFail(c)
	if !ok {
		return a.logAndFiberError(c, err, 500)
	}
	objStoreConfig := jetstream.ObjectStoreConfig{}
	err = c.BodyParser(&objStoreConfig)
	if err != nil {
		return a.logAndFiberError(c, err, 422)
	}
	os, err := js.UpdateObjectStore(c.Context(), objStoreConfig)
	if err != nil {
		return a.logAndFiberError(c, err, 500)
	}
	status, err := os.Status(c.Context())
	if err != nil {
		return a.logAndFiberError(c, err, 500)
	}
	return c.JSON(a.NewObjectStoreState(status))
}

func (a *App) HandleDeleteObjStore(c *fiber.Ctx) error {
	js, ok, err := a.jsOrFail(c)
	if !ok {
		return a.logAndFiberError(c, err, 500)
	}
	bucket := c.Params("bucket")
	os, err := js.ObjectStore(c.Context(), bucket)
	if err != nil {
		return a.logAndFiberError(c, err, 500)
	}
	err = os.Delete(c.Context(), bucket)
	if err != nil {
		return a.logAndFiberError(c, err, 500)
	}
	return c.SendStatus(200)
}

func parseStreamConfigToObjStoreConfig(bs jetstream.ObjectStoreStatus, scfg jetstream.StreamConfig) *jetstream.ObjectStoreConfig {
	return &jetstream.ObjectStoreConfig{
		Bucket:      bs.Bucket(),
		Description: bs.Description(),
		TTL:         bs.TTL(),
		MaxBytes:    scfg.MaxBytes,
		Storage:     bs.Storage(),
		Replicas:    bs.Replicas(),
		Placement:   scfg.Placement,
		Compression: bs.IsCompressed(),
		Metadata:    bs.Metadata(),
	}
}
