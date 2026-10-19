package nui

import (
	"path/filepath"

	"github.com/nats-nui/nui/internal/connection"
	"github.com/nats-nui/nui/internal/metrics"
	cddlschema2 "github.com/nats-nui/nui/internal/schemas/cddlschema"
	protoschema2 "github.com/nats-nui/nui/internal/schemas/protoschema"
	"github.com/nats-nui/nui/internal/ws"
	"github.com/nats-nui/nui/pkg/clicontext"
	"github.com/nats-nui/nui/pkg/logging"
)

type Nui struct {
	ConnRepo         connection.ConnRepo
	ConnPool         connection.Pool[*connection.NatsConn]
	ProtoRepo        protoschema2.ProtoRepo
	CddlRepo         cddlschema2.CddlRepo
	CliConnImporter  clicontext.Importer[clicontext.ImportedContextEntry]
	MetricsCollector metrics.MetricsCollector
	Hub              ws.IHub
	l                logging.Slogger
}

func New(opts ...Option) (*Nui, error) {
	cfg, err := newConfig(opts...)
	if err != nil {
		return nil, err
	}

	store, err := cfg.openStore()
	if err != nil {
		return nil, err
	}
	connRepo := connection.NewDocStoreConnRepo(store)
	connPool := connection.NewConnPool(connRepo, cfg.connBuilder())

	protoRepo, err := newProtoRepo(cfg.protoschemasPath)
	if err != nil {
		return nil, err
	}
	cddlRepo, err := newCddlRepo(cfg.cddlschemasPath, cfg.logger)
	if err != nil {
		return nil, err
	}

	metricsCollector := metrics.NewCollector(connRepo, cfg.connBuilder())
	return &Nui{
		ConnRepo:         connRepo,
		ConnPool:         connPool,
		ProtoRepo:        protoRepo,
		CddlRepo:         cddlRepo,
		CliConnImporter:  clicontext.NewImporter(cfg.logger),
		MetricsCollector: metricsCollector,
		Hub:              ws.NewNatsHub(connPool, metricsCollector, cfg.logger),
		l:                cfg.logger,
	}, nil
}

func newProtoRepo(path string) (protoschema2.ProtoRepo, error) {
	dir, err := filepath.Abs(path)
	if err != nil {
		return nil, err
	}
	return protoschema2.NewFileSystemProtoRepo(dir)
}

func newCddlRepo(path string, logger logging.Slogger) (cddlschema2.CddlRepo, error) {
	dir, err := filepath.Abs(path)
	if err != nil {
		return nil, err
	}
	return cddlschema2.NewFileSystemCddlRepo(dir, logger)
}

func Setup(dbPath, protoschemasPath, cddlschemasPath string, logger logging.Slogger) (*Nui, error) {
	return New(
		WithDBPath(dbPath),
		WithProtoSchemasPath(protoschemasPath),
		WithCddlSchemasPath(cddlschemasPath),
		WithLogger(logger),
	)
}
