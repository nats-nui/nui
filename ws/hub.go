package ws

import "github.com/nats-io/nats.go"

type Pool interface {
	Get(id string) (Conn, error)
}

type Subscription interface {
	Unsubscribe() error
}

type Conn interface {
	ChanSubscribe(subj string, ch chan *nats.Msg) (Subscription, error)
}

type WsSub struct {
	Subject  string
	Messages chan *nats.Msg
	Done     chan bool
}

type WsConn struct {
	Req      <-chan Request
	Messages chan<- Message
	Subs     []WsSub
}

type Hub struct {
	pool Pool
	reg  map[string]WsConn
}

func NewHub(pool Pool) *Hub {
	return &Hub{pool: pool}
}

func (h *Hub) Register(clientId string, req <-chan Request, messages chan<- Message) {

}
