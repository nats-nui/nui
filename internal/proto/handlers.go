package proto

import (
	"github.com/gofiber/fiber/v2"
)

// Handlers contains HTTP handlers for protobuf schema operations
type Handlers struct {
	repo ProtoRepo
}

// NewHandlers creates new protobuf handlers
func NewHandlers(repo ProtoRepo) *Handlers {
	return &Handlers{repo: repo}
}

// HandleIndexProtoSchemas returns all protobuf schemas
func (h *Handlers) HandleIndexProtoSchemas(c *fiber.Ctx) error {
	schemas, err := h.repo.All()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	// Convert map to slice for JSON response
	result := make([]*ProtoSchema, 0, len(schemas))
	for _, schema := range schemas {
		result = append(result, schema)
	}

	return c.JSON(result)
}

// HandleGetProtoSchema returns a specific protobuf schema
func (h *Handlers) HandleGetProtoSchema(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return c.Status(400).JSON(fiber.Map{"error": "schema ID is required"})
	}

	schema, err := h.repo.GetById(id)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(schema)
}

// HandleServeProtoContent serves the raw protobuf schema content
func (h *Handlers) HandleServeProtoContent(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return c.Status(400).JSON(fiber.Map{"error": "schema ID is required"})
	}

	schema, err := h.repo.GetById(id)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": err.Error()})
	}

	c.Set("Content-Type", "application/x-protobuf")
	c.Set("Content-Disposition", "attachment; filename=\""+schema.Name+"\"")
	return c.SendString(schema.Content)
}