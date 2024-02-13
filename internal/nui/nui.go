package nui

import (
	connection2 "github.com/pricelessrabbit/nui/internal/connection"
	"github.com/pricelessrabbit/nui/internal/ws"
	"github.com/pricelessrabbit/nui/pkg/logging"
	docstore "github.com/pricelessrabbit/nui/pkg/storage"
)

type Nui struct {
	ConnRepo connection2.ConnRepo
	ConnPool connection2.Pool[*connection2.NatsConn]
	Hub      ws.IHub
	l        logging.Slogger
}

func Setup(dbPath string, logger logging.Slogger) (*Nui, error) {
	n := &Nui{}
	store, err := docstore.NewDocStore(dbPath)
	if err != nil {
		return nil, err
	}
	n.ConnRepo = connection2.NewDocStoreConnRepo(store)
	n.ConnPool = connection2.NewNatsConnPool(n.ConnRepo)
	n.Hub = ws.NewNatsHub(n.ConnPool, logger)
	n.l = logger
	return n, nil
}
