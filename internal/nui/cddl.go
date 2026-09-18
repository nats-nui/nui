package nui

import (
	"path/filepath"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/nats-nui/nui/internal/cddlschema"
)

// HandleIndexCddlSchemas returns all CDDL schemas
func (a *App) HandleIndexCddlSchemas(c *fiber.Ctx) error {
	schemas, err := a.nui.CddlRepo.All()
	if err != nil {
		a.l.Error("cannot list cddl schemas", "error", err)
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	result := make([]*cddlschema.CddlSchema, 0, len(schemas))
	for _, schema := range schemas {
		result = append(result, schema)
	}

	// the count answers the first question asked of an empty schema dropdown
	a.l.Debug("served cddl schema list", "count", len(result))
	return c.JSON(result)
}

// HandleGetCddlSchema returns a specific CDDL schema
func (a *App) HandleGetCddlSchema(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return c.Status(400).JSON(fiber.Map{"error": "schema ID is required"})
	}

	schema, err := a.nui.CddlRepo.GetById(id)
	if err != nil {
		a.l.Warn("cannot serve cddl schema", "id", id, "error", err)
		return c.Status(404).JSON(fiber.Map{"error": err.Error()})
	}

	a.l.Debug("served cddl schema", "id", schema.ID, "name", schema.Name)
	return c.JSON(schema)
}

// HandleServeCddlContent serves the raw CDDL schema content
func (a *App) HandleServeCddlContent(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return c.Status(400).JSON(fiber.Map{"error": "schema ID is required"})
	}

	schema, err := a.nui.CddlRepo.GetById(id)
	if err != nil {
		a.l.Warn("cannot serve cddl schema content", "id", id, "error", err)
		return c.Status(404).JSON(fiber.Map{"error": err.Error()})
	}

	a.l.Debug("served cddl schema content", "id", schema.ID, "bytes", len(schema.Content))
	c.Set("Content-Type", "text/plain; charset=utf-8")
	// name may be a relative path; only the leaf belongs in the header, and a
	// quote or newline in it would break the disposition line
	filename := strings.NewReplacer(`"`, "", "\n", "", "\r", "").Replace(filepath.Base(schema.Name))
	if filename == "" || filename == "." {
		filename = "schema.cddl"
	}
	c.Set("Content-Disposition", `attachment; filename="`+filename+`"`)
	return c.SendString(schema.Content)
}
