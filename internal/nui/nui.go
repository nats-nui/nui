package nui

import (
	"path/filepath"

	"github.com/nats-nui/nui/internal/connection"
	"github.com/nats-nui/nui/internal/metrics"
	"github.com/nats-nui/nui/internal/protoschema"
	"github.com/nats-nui/nui/internal/ws"
	"github.com/nats-nui/nui/pkg/clicontext"
	"github.com/nats-nui/nui/pkg/logging"
	docstore "github.com/nats-nui/nui/pkg/storage"
)

type Nui struct {
	ConnRepo         connection.ConnRepo
	ConnPool         connection.Pool[*connection.NatsConn]
	ProtoRepo        protoschema.ProtoRepo
	CliConnImporter  clicontext.Importer[clicontext.ImportedContextEntry]
	MetricsCollector metrics.MetricsCollector
	Hub              ws.IHub
	l                logging.Slogger
}

func Setup(dbPath, protoschemasPath string, logger logging.Slogger) (*Nui, error) {
	n := &Nui{}
	store, err := docstore.NewDocStore(dbPath)
	if err != nil {
		return nil, err
	}

	// Convert to absolute path
	protoDir, err := filepath.Abs(protoschemasPath)
	if err != nil {
		return nil, err
	}

	n.ConnRepo = connection.NewDocStoreConnRepo(store)
	n.ConnPool = connection.NewNatsConnPool(n.ConnRepo)
	n.ProtoRepo, err = protoschema.NewFileSystemProtoRepo(protoDir)
	if err != nil {
		return nil, err
	}
	n.CliConnImporter = clicontext.NewImporter(logger)
	n.MetricsCollector = metrics.NewCollector(n.ConnRepo, connection.NatsBuilder)
	hub := ws.NewNatsHub(n.ConnPool, n.MetricsCollector, logger)
	n.Hub = hub
	n.l = logger
	return n, nil
}
