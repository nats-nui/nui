package nui

import (
	"github.com/gofiber/fiber/v2"
	"github.com/nats-io/nats.go"
	"github.com/nats-nui/nui/internal/connection"
)

func (a *App) HandleIndexSubscriptions(c *fiber.Ctx) error {
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

func (a *App) HandleUpdateSubscriptions(c *fiber.Ctx) error {
	if c.Params("id") == "" {
		return c.Status(422).JSON("id is required")
	}
	var subs []connection.Subscription
	parseErr := c.BodyParser(&subs)
	a.nui.connWriteMu.Lock()
	defer a.nui.connWriteMu.Unlock()
	conn, err := a.nui.ConnRepo.GetById(c.Params("id"))
	if err != nil {
		return a.logAndFiberError(c, err, 404)
	}
	if parseErr != nil {
		return a.logAndFiberError(c, parseErr, 422)
	}
	updated := *conn
	updated.Subscriptions = subs
	conn, err = a.nui.ConnRepo.Save(&updated)
	if err != nil {
		return a.logAndFiberError(c, err, 500)
	}
	return c.JSON(conn.Subscriptions)
}

func (a *App) HandlePublish(c *fiber.Ctx) error {
	if c.Params("id") == "" {
		return c.Status(422).JSON("id is required")
	}
	conn, err := a.nui.ConnPool.Get(c.Params("id"))
	if err != nil {
		return a.logAndFiberError(c, err, 404)
	}
	pubReq := &msgReq{}
	err = c.BodyParser(pubReq)
	if err != nil {
		return a.logAndFiberError(c, err, 422)
	}

	msg := nats.NewMsg(pubReq.Subject)
	msg.Header = pubReq.Headers
	msg.Data = pubReq.Payload
	err = conn.PublishMsg(msg)
	if err != nil {
		return a.logAndFiberError(c, err, 500)
	}
	return c.SendStatus(200)
}
