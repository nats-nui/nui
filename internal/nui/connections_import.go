package nui

import (
	"context"
	"github.com/gofiber/fiber/v2"
	"github.com/nats-nui/nui/internal/connection"
	"github.com/nats-nui/nui/pkg/clicontext"
	"strings"
	"time"
)

const IMPORT_METADATA_KEY_TYPE = "import-type"
const IMPORT_METADATA_KEY_PATH = "import-path"
const IMPORT_METADATA_KEY_DATETIME = "import-datetime"
const IMPORT_TYPE_CLI = "nats-cli"

type CliImportRequest struct {
	Path string `json:"path"`
}

type CliConnImportResponse struct {
	Connections []connection.Connection           `json:"connections"`
	CliContexts []clicontext.ImportedContextEntry `json:"imports"`
}

func (a *App) HandleImportCliContextsFromPath(c *fiber.Ctx) error {
	req := CliImportRequest{}
	err := c.BodyParser(&req)
	if err != nil {
		return a.logAndFiberError(c, err, 422)
	}
	response, err := a.ImportCliContextsFromPath(c.Context(), req.Path)
	if err != nil {
		return a.logAndFiberError(c, err, 500)
	}
	return c.JSON(response)
}

func (a *App) ImportCliContextsFromPath(ctx context.Context, path string) (CliConnImportResponse, error) {

	cliContexts, err := a.nui.CliConnImporter.Import(path)
	if err != nil {
		return CliConnImportResponse{}, err
	}

	allConnections, err := a.nui.ConnRepo.All()
	if err != nil {
		return CliConnImportResponse{}, err
	}

	response := CliConnImportResponse{
		Connections: make([]connection.Connection, 0),
		CliContexts: make([]clicontext.ImportedContextEntry, 0),
	}
	for _, cliContext := range cliContexts {
		select {
		case <-ctx.Done():
			return response, ctx.Err()
		default:
			response.CliContexts = append(response.CliContexts, cliContext)
			if cliContext.Error != nil {
				continue
			}
			newConn, err := a.importConnFromCliContext(cliContext, allConnections)
			if err != nil {
				return response, err
			}
			response.Connections = append(response.Connections, newConn)
		}
	}
	return response, nil
}

func (a *App) importConnFromCliContext(cliContext clicontext.ImportedContextEntry, allConnections map[string]*connection.Connection) (connection.Connection, error) {
	alreadyImported, isAlreadyImported := findAlreadyImported(cliContext, allConnections)
	newOne := parseFromCliContext(cliContext.Name, cliContext.ImportedContext)
	if isAlreadyImported {
		newOne.Subscriptions = alreadyImported.Subscriptions
		newOne.Id = alreadyImported.Id
	}
	newOne.SetMetadata(IMPORT_METADATA_KEY_TYPE, IMPORT_TYPE_CLI)
	newOne.SetMetadata(IMPORT_METADATA_KEY_PATH, cliContext.Path)
	newOne.SetMetadata(IMPORT_METADATA_KEY_DATETIME, time.Now().Format(time.RFC3339))
	_, err := a.nui.ConnRepo.Save(&newOne)
	if err != nil {
		return connection.Connection{}, err
	}
	return newOne, nil
}

func findAlreadyImported(cliContext clicontext.ImportedContextEntry, connections map[string]*connection.Connection) (*connection.Connection, bool) {
	for _, conn := range connections {
		if importType, _ := conn.GetMetadata(IMPORT_METADATA_KEY_TYPE); importType != IMPORT_TYPE_CLI {
			continue
		}
		if importPath, _ := conn.GetMetadata(IMPORT_METADATA_KEY_PATH); importPath != cliContext.Path {
			continue
		}
		return conn, true
	}
	return &connection.Connection{}, false
}

func parseFromCliContext(name string, cliContext clicontext.CliConnectionContext) connection.Connection {
	var auths []connection.Auth

	if cliContext.User != "" && cliContext.Password != "" {
		auths = append(auths, connection.Auth{
			Mode:     connection.AuthModeUserPassword,
			Username: cliContext.User,
			Password: cliContext.Password,
		})
	}

	if cliContext.Token != "" {
		auths = append(auths, connection.Auth{
			Mode:  connection.AuthModeToken,
			Token: cliContext.Token,
		})
	}

	if cliContext.UserJWT != "" {
		auths = append(auths, connection.Auth{
			Mode: connection.AuthModeJwt,
			Jwt:  cliContext.UserJWT,
		})
	}

	if cliContext.NKey != "" {
		auths = append(auths, connection.Auth{
			Mode:     connection.AuthModeNKey,
			NKeySeed: cliContext.NKey,
		})
	}

	if cliContext.Creds != "" {
		auths = append(auths, connection.Auth{
			Mode:  connection.AuthModeCredsFile,
			Creds: cliContext.Creds,
		})
	}
	if len(auths) > 0 {
		auths[0].Active = true
	}
	var hosts []string
	if cliContext.URL != "" {
		hosts = append(hosts, strings.Split(cliContext.URL, ",")...)
	}
	return connection.Connection{
		Name:        name,
		Hosts:       hosts,
		InboxPrefix: cliContext.InboxPrefix,
		Auth:        auths,
		TLSAuth: connection.TLSAuth{
			Enabled:        cliContext.Cert != "" && cliContext.Key != "",
			CertPath:       cliContext.Cert,
			KeyPath:        cliContext.Key,
			CaPath:         cliContext.CA,
			HandshakeFirst: cliContext.TLSFirst,
		},
	}
}
