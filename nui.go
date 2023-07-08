package main

import (
	"github.com/nats-io/nats.go"
	"github.com/pricelessrabbit/nui/connection"
	"github.com/pricelessrabbit/nui/ws"
)

type Nui struct {
	ConnRepo connection.ConnRepo
	ConnPool connection.Pool[*nats.Conn]
	Hub      ws.IHub
}

func NewNui() *Nui {
	n := &Nui{}
	n.ConnRepo = connection.NewMemConnRepo()
	n.ConnPool = connection.NewNatsConnPool(n.ConnRepo)
	n.Hub = ws.NewNatsHub(n.ConnPool)
	return n
}
