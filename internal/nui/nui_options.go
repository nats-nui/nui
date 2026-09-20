package nui

import (
	"errors"

	"github.com/nats-nui/nui/internal/connection"
	"github.com/nats-nui/nui/pkg/logging"
	docstore "github.com/nats-nui/nui/pkg/storage"
)

const defaultDBPath = ":memory:"

type config struct {
	dbPath           string
	docStore         *docstore.DB
	protoschemasPath string
	cddlschemasPath  string
	logger           logging.Slogger
	connPoolBuilder  connection.ConnBuilder[*connection.NatsConn]
}

type Option func(*config) error

func newConfig(opts ...Option) (*config, error) {
	cfg := &config{dbPath: defaultDBPath}
	for _, opt := range opts {
		if err := opt(cfg); err != nil {
			return nil, err
		}
	}
	if cfg.logger == nil {
		return nil, errors.New("nui: logger is required")
	}
	return cfg, nil
}

// openStore returns the injected doc store, or opens one at the configured path.
func (c *config) openStore() (*docstore.DB, error) {
	if c.docStore != nil {
		return c.docStore, nil
	}
	return docstore.NewDocStore(c.dbPath)
}

// connBuilder returns the injected NATS connection builder, or the production one.
func (c *config) connBuilder() connection.ConnBuilder[*connection.NatsConn] {
	if c.connPoolBuilder != nil {
		return c.connPoolBuilder
	}
	return connection.NatsBuilder
}

func WithDBPath(path string) Option {
	return func(c *config) error {
		c.dbPath = path
		return nil
	}
}

func WithDocStore(db *docstore.DB) Option {
	return func(c *config) error {
		c.docStore = db
		return nil
	}
}

func WithLogger(l logging.Slogger) Option {
	return func(c *config) error {
		c.logger = l
		return nil
	}
}

func WithProtoSchemasPath(path string) Option {
	return func(c *config) error {
		c.protoschemasPath = path
		return nil
	}
}

func WithCddlSchemasPath(path string) Option {
	return func(c *config) error {
		c.cddlschemasPath = path
		return nil
	}
}

func WithConnPoolBuilder(builder connection.ConnBuilder[*connection.NatsConn]) Option {
	return func(c *config) error {
		c.connPoolBuilder = builder
		return nil
	}
}
