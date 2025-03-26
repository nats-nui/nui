package nui

import (
	"context"
	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/compress"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/nats-nui/nui/pkg/logging"
	slogfiber "github.com/samber/slog-fiber"
	"log/slog"
)

type App struct {
	*fiber.App
	l    logging.Slogger
	Port string
	nui  *Nui
	ctx  context.Context
}

func NewServer(port string, nui *Nui, l logging.Slogger, isDesktop bool) *App {

	app := &App{
		App: fiber.New(
			fiber.Config{
				UnescapePath: true,
			}),
		Port: port,
		nui:  nui,
		l:    l,
	}
	sLog, ok := l.(*slog.Logger)
	if ok {
		app.Use(slogfiber.New(sLog))
	}
	app.Use(compress.New(compress.Config{
		Level: compress.LevelDefault,
	}))

	// wails in linux / mac desktop app is using wails://wails, http://wails.localhost, http://wails.:34115 as origins
	// that are not supported by fiber anymore, so * wildcard is required to make call to server on 31311
	if isDesktop {
		allowedOrigins := "*"
		app.Use(cors.New(cors.Config{
			AllowOrigins: allowedOrigins,
			AllowHeaders: "Origin, Content-Type, Accept",
		}))
	}
	app.registerHandlers()
	return app
}

func (a *App) registerHandlers() {

	a.Get("/health", a.handleHealth)

	a.Get("/api/about", a.handleAbout)

	a.Get("/api/connection", a.HandleIndexConnections)
	a.Get("/api/connection/:id", a.HandleGetConnection)
	a.Post("/api/connection", a.HandleSaveConnection)
	a.Post("/api/connection/:id", a.HandleSaveConnection)
	a.Delete("/api/connection/:id", a.HandleDeleteConnection)

	a.Post("/api/connection/import/nats-cli", a.HandleImportCliContextsFromPath)

	a.Get("/api/connection/:id/messages/subscription", a.HandleIndexSubscriptions)
	a.Post("/api/connection/:id/messages/subscription", a.HandleUpdateSubscriptions)

	a.Post("/api/connection/:id/messages/publish", a.HandlePublish)
	a.Post("/api/connection/:id/request", a.HandleRequest)

	a.Get("/api/connection/:connection_id/stream", a.HandleIndexStreams)
	a.Get("/api/connection/:connection_id/stream/:stream_name", a.HandleShowStream)
	a.Post("/api/connection/:connection_id/stream", a.HandleCreateStream)
	a.Post("/api/connection/:connection_id/stream/:stream_name", a.HandleUpdateStream)
	a.Delete("/api/connection/:connection_id/stream/:stream_name", a.HandleDeleteStream)
	a.Post("/api/connection/:connection_id/stream/:stream_name/purge", a.HandlePurgeStream)

	a.Get("/api/connection/:connection_id/stream/:stream_name/consumer", a.HandleIndexStreamConsumers)
	a.Get("/api/connection/:connection_id/stream/:stream_name/consumer/:consumer_name", a.handleShowStreamConsumer)
	a.Post("/api/connection/:connection_id/stream/:stream_name/consumer", a.handleCreateStreamConsumer)
	a.Post("/api/connection/:connection_id/stream/:stream_name/consumer/:consumer_name", a.handleUpdateStreamConsumer)
	a.Delete("/api/connection/:connection_id/stream/:stream_name/consumer/:consumer_name", a.handleDeleteStreamConsumer)

	a.Get("/api/connection/:connection_id/stream/:stream_name/messages", a.HandleIndexStreamMessages)
	a.Delete("/api/connection/:connection_id/stream/:stream_name/messages/:seq", a.HandleDeleteStreamMessage)

	a.Get("/api/connection/:connection_id/kv", a.HandleIndexBuckets)
	a.Get("/api/connection/:connection_id/kv/:bucket", a.HandleShowBucket)
	a.Post("/api/connection/:connection_id/kv", a.HandleCreateBucket)
	a.Post("/api/connection/:connection_id/kv/:bucket", a.HandleUpdateBucket)
	a.Delete("/api/connection/:connection_id/kv/:bucket", a.HandleDeleteBucket)
	a.Post("/api/connection/:connection_id/kv/:bucket/purge_deleted", a.HandlePurgeDeletedKeys)

	a.Get("/api/connection/:connection_id/kv/:bucket/key", a.HandleIndexKeys)
	a.Get("/api/connection/:connection_id/kv/:bucket/key/:key", a.HandleShowKey)
	a.Post("/api/connection/:connection_id/kv/:bucket/key/:key", a.HandlePutKey)
	a.Delete("/api/connection/:connection_id/kv/:bucket/key/:key", a.HandleDeleteKey)
	a.Post("/api/connection/:connection_id/kv/:bucket/key/:key/purge", a.HandlePurgeKey)

	a.Use("/ws", func(c *fiber.Ctx) error {
		if websocket.IsWebSocketUpgrade(c) {
			c.Locals("allowed", true)
			return c.Next()
		}
		return fiber.ErrUpgradeRequired
	})
	a.Get("/ws/sub", websocket.New(a.HandleWsSub))

	a.Static("/", "./frontend/dist")
	a.Static("/*", "./frontend/dist/index,html")

}

func (a *App) Start(ctx context.Context) error {
	a.ctx = ctx
	go func() {
		select {
		case <-ctx.Done():
			_ = a.Shutdown()
		}
	}()
	return a.Listen(":" + a.Port)
}

func (a *App) handleHealth(c *fiber.Ctx) error {
	return c.SendStatus(200)
}
