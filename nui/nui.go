package nui

import (
	"github.com/pricelessrabbit/nui/connection"
	"github.com/pricelessrabbit/nui/pkg/logging"
	docstore "github.com/pricelessrabbit/nui/pkg/storage"
	"github.com/pricelessrabbit/nui/ws"
)

type Nui struct {
	ConnRepo connection.ConnRepo
	ConnPool connection.Pool[*connection.NatsConn]
	Hub      ws.IHub
	l        logging.Slogger
}

func Setup(dbPath string, logger logging.Slogger) (*Nui, error) {
	n := &Nui{}
	store, err := docstore.NewDocStore(dbPath)
	if err != nil {
		return nil, err
	}
	n.ConnRepo = connection.NewDocStoreConnRepo(store)
	n.ConnPool = connection.NewNatsConnPool(n.ConnRepo)
	n.Hub = ws.NewNatsHub(n.ConnPool, logger)
	n.l = logger
	return n, nil
}
