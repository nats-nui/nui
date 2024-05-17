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

func NewServer(port string, nui *Nui, l logging.Slogger) *App {

	app := &App{
		App:  fiber.New(),
		Port: port,
		nui:  nui,
		l:    l,
	}
	sLog, ok := l.(*slog.Logger)
	if ok {
		app.Use(slogfiber.New(sLog))
	}
	app.Use(compress.New(compress.Config{
		Level: compress.LevelBestCompression,
	}))
	allowedOrigins := "http://wails.localhost, wails://wails, wails://localhost, http://wails.:34115, wails://wails:34115, wails://wails.localhost:34115"
	app.Use(cors.New(cors.Config{
		AllowOrigins: allowedOrigins,
		AllowHeaders: "Origin, Content-Type, Accept",
	}))
	app.registerHandlers()
	return app
}

func (a *App) registerHandlers() {

	a.Get("/health", a.handleHealth)

	a.Get("/api/about", a.handleAbout)

	a.Get("/api/connection", a.handleIndexConnections)
	a.Get("/api/connection/:id", a.handleGetConnection)
	a.Post("/api/connection", a.handleSaveConnection)
	a.Post("/api/connection/:id", a.handleSaveConnection)
	a.Delete("/api/connection/:id", a.handleDeleteConnection)

	a.Get("/api/connection/:id/messages/subscription", a.handleIndexSubscriptions)
	a.Post("/api/connection/:id/messages/subscription", a.handleUpdateSubscriptions)

	a.Post("/api/connection/:id/messages/publish", a.handlePublish)
	a.Post("/api/connection/:id/request", a.handleRequest)

	a.Get("/api/connection/:connection_id/stream", a.handleIndexStreams)
	a.Get("/api/connection/:connection_id/stream/:stream_name", a.handleShowStream)
	a.Post("/api/connection/:connection_id/stream", a.handleCreateStream)
	a.Post("/api/connection/:connection_id/stream/:stream_name", a.handleUpdateStream)
	a.Delete("/api/connection/:connection_id/stream/:stream_name", a.handleDeleteStream)
	a.Post("/api/connection/:connection_id/stream/:stream_name/purge", a.handlePurgeStream)

	a.Get("/api/connection/:connection_id/stream/:stream_name/consumer", a.handleIndexStreamConsumers)
	a.Get("/api/connection/:connection_id/stream/:stream_name/consumer/:consumer_name", a.handleShowStreamConsumer)
	a.Post("/api/connection/:connection_id/stream/:stream_name/consumer", a.handleCreateStreamConsumer)
	a.Post("/api/connection/:connection_id/stream/:stream_name/consumer/:consumer_name", a.handleUpdateStreamConsumer)
	a.Delete("/api/connection/:connection_id/stream/:stream_name/consumer/:consumer_name", a.handleDeleteStreamConsumer)

	a.Get("/api/connection/:connection_id/stream/:stream_name/messages", a.handleIndexStreamMessages)
	a.Delete("/api/connection/:connection_id/stream/:stream_name/messages/:seq", a.handleDeleteStreamMessage)

	a.Get("/api/connection/:connection_id/kv", a.handleIndexBuckets)
	a.Get("/api/connection/:connection_id/kv/:bucket", a.handleShowBucket)
	a.Post("/api/connection/:connection_id/kv", a.handleCreateBucket)
	a.Delete("/api/connection/:connection_id/kv/:bucket", a.handleDeleteBucket)

	a.Get("/api/connection/:connection_id/kv/:bucket/key", a.handleIndexKeys)
	a.Get("/api/connection/:connection_id/kv/:bucket/key/:key", a.handleShowKey)
	a.Post("/api/connection/:connection_id/kv/:bucket/key/:key", a.handlePutKey)
	a.Delete("/api/connection/:connection_id/kv/:bucket/key/:key", a.handleDeleteKey)
	a.Post("/api/connection/:connection_id/kv/:bucket/key/:key/purge", a.handlePurgeKey)

	a.Use("/ws", func(c *fiber.Ctx) error {
		if websocket.IsWebSocketUpgrade(c) {
			c.Locals("allowed", true)
			return c.Next()
		}
		return fiber.ErrUpgradeRequired
	})
	a.Get("/ws/sub", websocket.New(a.handleWsSub))

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
