package nui

import (
	"context"
	"encoding/base64"
	"errors"
	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/log"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/google/uuid"
	"github.com/pricelessrabbit/nui/connection"
	"github.com/pricelessrabbit/nui/ws"
	"time"
)

type App struct {
	*fiber.App
	Port string
	nui  *Nui
	ctx  context.Context
}

func NewServer(port string, nui *Nui) *App {
	log.SetLevel(log.LevelTrace)
	app := &App{
		App:  fiber.New(),
		Port: port,
		nui:  nui,
	}
	// Or extend your config for customization
	app.Use(cors.New(cors.Config{
		AllowOrigins: "http://wails.localhost, wails://wails, wails://localhost",
		AllowHeaders: "Origin, Content-Type, Accept",
	}))
	app.registerHandlers()
	return app
}

func (a *App) registerHandlers() {

	a.Get("/health", a.handleHealth)

	a.Get("/api/connection", a.handleGetConnections)
	a.Get("/api/connection/:id", a.handleGetConnection)
	a.Post("/api/connection", a.handleSaveConnection)
	a.Post("/api/connection/:id", a.handleSaveConnection)
	a.Delete("/api/connection/:id", a.handleDeleteConnection)

	a.Post("/api/connection/:id/publish", a.handlePublish)
	a.Post("/api/connection/:id/request", a.handleRequest)

	a.Get("/api/connection/:connection_id/stream", a.handleIndexStreams)
	a.Get("/api/connection/:connection_id/stream/:stream_name", a.handleShowStream)
	a.Post("/api/connection/:connection_id/stream", a.handleCreateStream)
	a.Post("/api/connection/:connection_id/stream/:stream_name", a.handleUpdateStream)
	a.Delete("/api/connection/:connection_id/stream/:stream_name", a.handleDeleteStream)

	a.Get("/api/connection/:connection_id/stream/:stream_name/consumer", a.handleIndexStreamConsumers)
	a.Get("/api/connection/:connection_id/stream/:stream_name/consumer/:consumer_name", a.handleShowStreamConsumer)

	a.Get("/api/connection/:connection_id/stream/:stream_name/messages", a.handleIndexStreamMessages)

	a.Get("/api/connection/:connection_id/kv", a.handleIndexBuckets)
	a.Get("/api/connection/:connection_id/kv/:bucket", a.handleShowBucket)
	a.Post("/api/connection/:connection_id/kv", a.handleCreateBucket)
	a.Delete("/api/connection/:connection_id/kv/:bucket", a.handleDeleteBucket)

	a.Get("/api/connection/:connection_id/kv/:bucket/key", a.handleIndexKeys)
	a.Get("/api/connection/:connection_id/kv/:bucket/key/:key", a.handleShowKey)
	a.Post("/api/connection/:connection_id/kv/:bucket/key/:key", a.handlePutKey)
	a.Delete("/api/connection/:connection_id/kv/:bucket/key/:key", a.handleDeleteKey)

	a.Use("/ws", func(c *fiber.Ctx) error {
		if websocket.IsWebSocketUpgrade(c) {
			c.Locals("allowed", true)
			return c.Next()
		}
		return fiber.ErrUpgradeRequired
	})
	a.Get("/ws/sub", websocket.New(a.handleWsSub))

	a.Static("/", "./web/dist")
	a.Static("/*", "./web/dist/index,html")

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

func (a *App) handleGetConnections(c *fiber.Ctx) error {
	connections, err := a.nui.ConnRepo.All()
	if err != nil {
		return err
	}
	connArray := make([]*connection.Connection, 0)
	for _, conn := range connections {
		connArray = append(connArray, conn)
	}
	return c.JSON(connArray)
}

func (a *App) handlePublish(c *fiber.Ctx) error {
	if c.Params("id") == "" {
		return c.Status(422).JSON("id is required")
	}
	conn, err := a.nui.ConnPool.Get(c.Params("id"))
	if err != nil {
		return c.Status(404).JSON(err.Error())
	}
	pubReq := &struct {
		Subject string `json:"subject"`
		Payload string `json:"payload"`
	}{}
	err = c.BodyParser(pubReq)
	if err != nil {
		return c.Status(422).JSON(err.Error())
	}

	payload, err := base64.StdEncoding.DecodeString(pubReq.Payload)
	if err != nil {
		return c.Status(422).JSON(err.Error())
	}

	err = conn.Publish(pubReq.Subject, payload)
	if err != nil {
		return c.Status(500).JSON(err.Error())
	}
	return c.SendStatus(200)
}

func (a *App) handleRequest(c *fiber.Ctx) error {
	if c.Params("id") == "" {
		return c.Status(422).JSON("id is required")
	}
	conn, err := a.nui.ConnPool.Get(c.Params("id"))
	if err != nil {
		return c.Status(404).JSON(err.Error())
	}
	req := &struct {
		Subject   string `json:"subject"`
		Payload   []byte `json:"payload"`
		TimeoutMs int    `json:"timeout_ms"`
	}{}
	err = c.BodyParser(req)
	if err != nil {
		return c.Status(422).JSON(err.Error())
	}
	timeout := 200 * time.Millisecond
	if req.TimeoutMs > 0 {
		timeout = time.Duration(req.TimeoutMs) * time.Millisecond
	}
	if err != nil {
		return c.Status(422).JSON(err.Error())
	}
	msg, err := conn.Request(req.Subject, req.Payload, timeout)
	if err != nil {
		return c.Status(500).SendString(err.Error())
	}
	reply := &struct {
		Payload []byte `json:"payload"`
	}{Payload: msg.Data}
	return c.JSON(reply)
}

func (a *App) handleWsSub(c *websocket.Conn) {
	connId := c.Query("id")
	if connId == "" {
		writeError(c, 4422, errors.New("id is required"))
		return
	}
	conn, err := a.nui.ConnRepo.GetById(connId)
	if err != nil {
		writeError(c, 4404, err)
		return
	}
	ctx, cancel := context.WithCancel(a.ctx)
	clientId := uuid.NewString()
	reqCh := make(chan *ws.Request, 1)
	msgCh := make(chan ws.Payload, 1000)

	c.SetCloseHandler(func(code int, text string) error {
		cancel()
		return nil
	})

	err = a.nui.Hub.Register(ctx, clientId, conn.Id, reqCh, msgCh)
	if err != nil {
		writeError(c, 4500, err)
		return
	}

	go handleWsMsgs(c, ctx, msgCh, cancel)
	go handleWsRequest(c, ctx, reqCh, cancel)
	<-ctx.Done()
}

func handleWsRequest(c *websocket.Conn, ctx context.Context, reqCh chan *ws.Request, cancel context.CancelFunc) {
	for {
		req := &ws.Request{}
		err := c.ReadJSON(req)
		if err != nil {
			cancel()
			writeError(c, 4422, err)
			return
		}
		select {
		case <-ctx.Done():
			return
		case reqCh <- req:
		default:
		}
	}
}

func handleWsMsgs(c *websocket.Conn, ctx context.Context, msgCh chan ws.Payload, cancel context.CancelFunc) {
	for {
		select {
		case <-ctx.Done():
			return
		case msg := <-msgCh:
			message := ws.NewWsMessage(msg)
			err := c.WriteJSON(message)
			if err != nil {
				cancel()
				writeError(c, 4422, err)
				return
			}
		}
	}
}

func writeError(c *websocket.Conn, status int, err error) {
	_ = c.WriteMessage(
		websocket.CloseMessage,
		websocket.FormatCloseMessage(status, err.Error()))
}
