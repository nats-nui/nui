package nui

import (
	"github.com/gofiber/fiber/v2"
	"github.com/nats-nui/nui/internal/connection"
)

func (a *App) HandleIndexConnections(c *fiber.Ctx) error {
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

func (a *App) HandleGetConnection(c *fiber.Ctx) error {
	if c.Params("id") == "" {
		return c.Status(422).JSON("id is required")
	}
	conn, err := a.nui.ConnRepo.GetById(c.Params("id"))
	if err != nil {
		return a.logAndFiberError(c, err, 404)
	}
	return c.JSON(conn)
}

func (a *App) HandleSaveConnection(c *fiber.Ctx) error {
	conn := &connection.Connection{}
	err := c.BodyParser(conn)
	if err != nil {
		return a.logAndFiberError(c, err, 422)
	}
	if c.Params("id") != "" {
		connToUpdate, err := a.nui.ConnRepo.GetById(c.Params("id"))
		if err != nil {
			return a.logAndFiberError(c, err, 404)
		}
		conn.Id = c.Params("id")
		conn.Subscriptions = connToUpdate.Subscriptions
	}
	conn, err = a.nui.ConnRepo.Save(conn)
	if err != nil {
		return a.logAndFiberError(c, err, 500)
	}
	err = a.nui.ConnPool.Refresh(conn.Id)
	if err != nil {
		return a.logAndFiberError(c, err, 500)
	}
	return c.JSON(conn)
}

func (a *App) HandleDeleteConnection(ctx *fiber.Ctx) error {
	if ctx.Params("id") == "" {
		return ctx.Status(422).JSON("id is required")
	}
	err := a.nui.ConnRepo.Remove(ctx.Params("id"))
	if err != nil {
		return ctx.Status(500).JSON(err.Error())
	}
	a.nui.ConnPool.Purge()
	return ctx.SendStatus(200)
}
