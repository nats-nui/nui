package ws

import (
	"context"
	"github.com/nats-io/nats.go"
	"sync"
)

type Pool[S Subscription, T Conn[S]] interface {
	Get(id string) (T, error)
}

type Subscription interface {
	Unsubscribe() error
}

type Conn[S Subscription] interface {
	ChanSubscribe(subj string, ch chan *nats.Msg) (S, error)
}

type IHub interface {
	Register(ctx context.Context, clientId string, req <-chan *Request, messages chan<- *Message, errors chan<- error)
}

type Hub[S Subscription, T Conn[S]] struct {
	pool Pool[S, T]
	reg  map[string]*ClientConn[S]
}

func NewHub[S Subscription, T Conn[S]](pool Pool[S, T]) *Hub[S, T] {
	return &Hub[S, T]{
		pool: pool,
		reg:  make(map[string]*ClientConn[S]),
	}
}

func NewNatsHub(pool Pool[*nats.Subscription, *nats.Conn]) *Hub[*nats.Subscription, *nats.Conn] {
	return NewHub[*nats.Subscription, *nats.Conn](pool)
}

func (h *Hub[S, T]) Register(ctx context.Context, clientId string, req <-chan Request, messages chan<- *Message, errors chan<- error) {
	h.purgeConnection(clientId)
	go h.ListenRequests(clientId, req, messages, ctx.Done(), errors)
}

func (h *Hub[S, T]) ListenRequests(clientId string, req <-chan Request, messages chan<- *Message, done <-chan struct{}, errors chan<- error) {
	for {
		select {
		case <-done:
			h.purgeConnection(clientId)
			return
		case r := <-req:
			h.purgeConnection(clientId)
			err := h.registerConnection(clientId, r, messages)
			if err != nil {
				go func() {
					select {
					case errors <- err:
					default:
					}
				}()
			}
		}
	}
}

func (h *Hub[S, T]) purgeConnection(clientId string) {
	currentConn, ok := h.reg[clientId]
	if ok {
		currentConn.UnsubscribeAll()
	}
	delete(h.reg, clientId)
}

func (h *Hub[S, T]) registerConnection(clientId string, req Request, messages chan<- *Message) error {
	serverConn, err := h.pool.Get(req.ConnectionId)
	if err != nil {
		return err
	}
	subs := make([]ClientSub[S], 0)
	chans := make([]<-chan *nats.Msg, 0)
	for _, sbj := range req.Subjects {
		s := NewClientSub[S](sbj)
		sub, err := serverConn.ChanSubscribe(sbj, s.Messages)
		if err != nil {
			return err
		}
		s.Sub = sub
		subs = append(subs, s)
		chans = append(chans, s.Messages)
	}
	h.reg[clientId] = NewWClientConn[S](messages, subs)
	go parseToClientMessage(fanIn(10, chans...), messages)
	return nil
}

func parseToClientMessage(natsMsg <-chan *nats.Msg, clientMgs chan<- *Message) {
	for {
		select {
		case msg, ok := <-natsMsg:
			if !ok {
				return
			}
			cm := &Message{
				Subject:  msg.Subject,
				Payload:  msg.Data,
				Metadata: Metadata{},
			}
			clientMgs <- cm
		}
	}
}

func fanIn(buffer int, ins ...<-chan *nats.Msg) <-chan *nats.Msg {
	var wg sync.WaitGroup
	out := make(chan *nats.Msg, buffer)
	// Start an output goroutine for each input channel in upstreams.
	wg.Add(len(ins))
	for _, c := range ins {
		go func(c <-chan *nats.Msg) {
			for n := range c {
				out <- n
			}
			wg.Done()
		}(c)
	}
	return out
}
