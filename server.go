package main

import (
	"context"
	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/pricelessrabbit/nui/connection"
	"github.com/pricelessrabbit/nui/ws"
	"time"
)

type App struct {
	*fiber.App
	port string
	nui  *Nui
	ctx  context.Context
}

func NewServer(port string, nui *Nui) *App {
	app := &App{
		App:  fiber.New(),
		port: port,
		nui:  nui,
	}
	app.registerHandlers()
	return app
}

func (a *App) registerHandlers() {
	a.Get("/api/connection", a.handleGetConnections)
	a.Get("/api/connection/:id", a.handleGetConnection)
	a.Post("/api/connection", a.HandleSaveConnection)
	a.Post("/api/connection/:id", a.HandleSaveConnection)
	a.Delete("/api/connection/:id", a.handleDeleteConnection)

	a.Post("/api/connection/:id/publish", a.handlePublish)
	a.Post("/api/connection/:id/request", a.handleRequest)

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
			a.Shutdown()
		}
	}()
	return a.Listen(":" + a.port)
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

func (a *App) handleGetConnection(c *fiber.Ctx) error {
	if c.Params("id") == "" {
		return c.Status(422).JSON("id is required")
	}
	conn, err := a.nui.ConnRepo.GetById(c.Params("id"))
	if err != nil {
		return c.Status(404).JSON(err)
	}
	return c.JSON(conn)
}

func (a *App) HandleSaveConnection(c *fiber.Ctx) error {
	conn := &connection.Connection{}
	err := c.BodyParser(conn)
	if err != nil {
		return c.Status(422).JSON(err)
	}
	if c.Params("id") != "" {
		conn.Id = c.Params("id")
	}
	conn, err = a.nui.ConnRepo.Save(conn)
	if err != nil {
		return c.Status(500).JSON(err)
	}
	err = a.nui.ConnPool.Refresh(conn.Id)
	if err != nil {
		return c.Status(500).JSON(err)
	}
	return c.JSON(conn)
}

func (a *App) handleDeleteConnection(ctx *fiber.Ctx) error {
	if ctx.Params("id") == "" {
		return ctx.Status(422).JSON("id is required")
	}
	err := a.nui.ConnRepo.Remove(ctx.Params("id"))
	if err != nil {
		return ctx.Status(500).JSON(err)
	}
	a.nui.ConnPool.Purge()
	return ctx.SendStatus(200)
}

func (a *App) handlePublish(c *fiber.Ctx) error {
	if c.Params("id") == "" {
		return c.Status(422).JSON("id is required")
	}
	conn, err := a.nui.ConnPool.Get(c.Params("id"))
	if err != nil {
		return c.Status(404).JSON(err)
	}
	pubReq := &struct {
		Subject string `json:"subject"`
		Payload string `json:"payload"`
	}{}
	err = c.BodyParser(pubReq)
	if err != nil {
		return c.Status(422).JSON(err)
	}
	err = conn.Publish(pubReq.Subject, []byte(pubReq.Payload))
	if err != nil {
		return c.Status(500).JSON(err)
	}
	return c.SendStatus(200)
}

func (a *App) handleRequest(c *fiber.Ctx) error {
	if c.Params("id") == "" {
		return c.Status(422).JSON("id is required")
	}
	conn, err := a.nui.ConnPool.Get(c.Params("id"))
	if err != nil {
		return c.Status(404).JSON(err)
	}
	req := &struct {
		Subject   string `json:"subject"`
		Payload   []byte `json:"payload"`
		TimeoutMs int    `json:"timeout_ms"`
	}{}
	err = c.BodyParser(req)
	if err != nil {
		return c.Status(422).JSON(err)
	}
	timeout := 200 * time.Millisecond
	if req.TimeoutMs > 0 {
		timeout = time.Duration(req.TimeoutMs) * time.Millisecond
	}
	if err != nil {
		return c.Status(422).JSON(err)
	}
	msg, err := conn.Request(req.Subject, req.Payload, timeout)
	if err != nil {
		return c.Status(500).SendString(err.Error())
	}
	reply := &struct {
		Payload []byte `json:"data"`
	}{Payload: msg.Data}
	return c.JSON(reply)
}

func (a *App) handleWsSub(c *websocket.Conn) {
	ctx, cancel := context.WithCancel(a.ctx)
	reqCh := make(chan *ws.Request, 1)
	msgCh := make(chan *ws.Message, 1000)
	errCh := make(chan error, 10)
	clientId := uuid.NewString()
	go handleWsMsgs(c, ctx, msgCh, errCh, cancel)
	go handleWsRequest(c, ctx, reqCh, cancel)
	a.nui.Hub.Register(ctx, clientId, reqCh, msgCh, errCh)
	c.SetCloseHandler(func(code int, text string) error {
		cancel()
		return nil
	})
	<-ctx.Done()
}

func handleWsRequest(c *websocket.Conn, ctx context.Context, reqCh chan *ws.Request, cancel context.CancelFunc) {
	for {
		req := &ws.Request{}
		err := c.ReadJSON(req)
		if err != nil {
			cancel()
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

func handleWsMsgs(c *websocket.Conn, ctx context.Context, msgCh chan *ws.Message, errCh chan error, cancel context.CancelFunc) {
	for {
		select {
		case <-ctx.Done():
			return
		case msg := <-msgCh:
			err := c.WriteJSON(msg)
			if err != nil {
				cancel()
				return
			}
		case errMsg := <-errCh:
			err := c.WriteJSON(ws.Error{Error: errMsg.Error()})
			if err != nil {
				cancel()
				return
			}
		}
	}
}
