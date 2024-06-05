package nui

import (
	"encoding/base64"
	"github.com/gofiber/fiber/v2"
	"github.com/nats-io/nats.go"
	"github.com/nats-nui/nui/internal/connection"
	"time"
)

func (a *App) handleIndexSubscriptions(c *fiber.Ctx) error {
	if c.Params("id") == "" {
		return c.Status(422).JSON("id is required")
	}
	conn, err := a.nui.ConnRepo.GetById(c.Params("id"))
	if err != nil {
		return a.logAndFiberError(c, err, 404)
	}
	if conn.Subscriptions == nil {
		return c.JSON(make([]connection.Subscription, 0))
	}
	return c.JSON(conn.Subscriptions)
}

func (a *App) handleUpdateSubscriptions(c *fiber.Ctx) error {
	if c.Params("id") == "" {
		return c.Status(422).JSON("id is required")
	}
	conn, err := a.nui.ConnRepo.GetById(c.Params("id"))
	if err != nil {
		return a.logAndFiberError(c, err, 404)
	}
	var subs []connection.Subscription
	err = c.BodyParser(&subs)
	if err != nil {
		return a.logAndFiberError(c, err, 422)
	}
	conn.Subscriptions = subs
	conn, err = a.nui.ConnRepo.Save(conn)
	if err != nil {
		return a.logAndFiberError(c, err, 500)
	}
	return c.JSON(conn.Subscriptions)
}

func (a *App) handlePublish(c *fiber.Ctx) error {
	if c.Params("id") == "" {
		return c.Status(422).JSON("id is required")
	}
	conn, err := a.nui.ConnPool.Get(c.Params("id"))
	if err != nil {
		return a.logAndFiberError(c, err, 404)
	}
	pubReq := &struct {
		Subject string      `json:"subject"`
		Headers nats.Header `json:"headers"`
		Payload string      `json:"payload"`
	}{}
	err = c.BodyParser(pubReq)
	if err != nil {
		return a.logAndFiberError(c, err, 422)
	}

	payload, err := base64.StdEncoding.DecodeString(pubReq.Payload)
	if err != nil {
		return a.logAndFiberError(c, err, 422)
	}
	msg := nats.NewMsg(pubReq.Subject)
	msg.Header = pubReq.Headers
	msg.Data = payload
	err = conn.PublishMsg(msg)
	if err != nil {
		return a.logAndFiberError(c, err, 500)
	}
	return c.SendStatus(200)
}

func (a *App) handleRequest(c *fiber.Ctx) error {
	if c.Params("id") == "" {
		return c.Status(422).JSON("id is required")
	}
	conn, err := a.nui.ConnPool.Get(c.Params("id"))
	if err != nil {
		return a.logAndFiberError(c, err, 404)
	}
	req := &struct {
		Subject   string `json:"subject"`
		Payload   []byte `json:"payload"`
		TimeoutMs int    `json:"timeout_ms"`
	}{}
	err = c.BodyParser(req)
	if err != nil {
		return a.logAndFiberError(c, err, 422)
	}
	timeout := 200 * time.Millisecond
	if req.TimeoutMs > 0 {
		timeout = time.Duration(req.TimeoutMs) * time.Millisecond
	}
	if err != nil {
		return a.logAndFiberError(c, err, 422)
	}
	msg, err := conn.Request(req.Subject, req.Payload, timeout)
	if err != nil {
		return a.logAndFiberError(c, err, 500)
	}
	reply := &struct {
		Subject string `json:"subject"`
		Payload []byte `json:"payload"`
	}{Payload: msg.Data, Subject: msg.Subject}
	return c.JSON(reply)
}
