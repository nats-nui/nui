package nui

import (
	"github.com/gofiber/fiber/v2"
	"github.com/nats-io/nats.go"
	"time"
)

type msgReq struct {
	Subject   string      `json:"subject"`
	Payload   []byte      `json:"payload"`
	Headers   nats.Header `json:"headers"`
	TimeoutMs int         `json:"timeout_ms"`
}

func (a *App) HandleRequest(c *fiber.Ctx) error {
	if c.Params("id") == "" {
		return c.Status(422).JSON("id is required")
	}
	conn, err := a.nui.ConnPool.Get(c.Params("id"))
	if err != nil {
		return a.logAndFiberError(c, err, 404)
	}
	req := &msgReq{}
	err = c.BodyParser(req)
	if err != nil {
		return a.logAndFiberError(c, err, 422)
	}
	timeout := 2000 * time.Millisecond
	if req.TimeoutMs > 0 {
		timeout = time.Duration(req.TimeoutMs) * time.Millisecond
	}
	if err != nil {
		return a.logAndFiberError(c, err, 422)
	}
	reqMsg := nats.NewMsg(req.Subject)
	reqMsg.Data = req.Payload
	reqMsg.Header = req.Headers

	replyMsg, err := conn.RequestMsg(reqMsg, timeout)

	if err != nil {
		if err == nats.ErrTimeout {
			return a.logAndFiberError(c, err, 408)
		}
		return a.logAndFiberError(c, err, 500)
	}
	reply := &struct {
		Subject string      `json:"subject"`
		Payload []byte      `json:"payload"`
		Headers nats.Header `json:"headers"`
	}{Payload: replyMsg.Data, Subject: replyMsg.Subject, Headers: replyMsg.Header}
	return c.JSON(reply)
}
