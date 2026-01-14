package nui

import (
	"github.com/gofiber/fiber/v2"
	"github.com/nats-nui/nui/internal/protoschema"
)

// HandleIndexProtoSchemas returns all protobuf schemas
func (a *App) HandleIndexProtoSchemas(c *fiber.Ctx) error {
	schemas, err := a.nui.ProtoRepo.All()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	// Convert map to slice for JSON response
	result := make([]*protoschema.ProtoSchema, 0, len(schemas))
	for _, schema := range schemas {
		result = append(result, schema)
	}

	return c.JSON(result)
}

// HandleGetProtoSchema returns a specific protobuf schema
func (a *App) HandleGetProtoSchema(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return c.Status(400).JSON(fiber.Map{"error": "schema ID is required"})
	}

	schema, err := a.nui.ProtoRepo.GetById(id)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(schema)
}

// HandleServeProtoContent serves the raw protobuf schema content
func (a *App) HandleServeProtoContent(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return c.Status(400).JSON(fiber.Map{"error": "schema ID is required"})
	}

	schema, err := a.nui.ProtoRepo.GetById(id)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": err.Error()})
	}

	c.Set("Content-Type", "application/x-protobuf")
	c.Set("Content-Disposition", "attachment; filename=\""+schema.Name+"\"")
	return c.SendString(schema.Content)
}
