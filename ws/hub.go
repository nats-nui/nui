package ws

import (
	"context"
	"encoding/json"
	"errors"
	"github.com/mitchellh/mapstructure"
	"github.com/nats-io/nats.go"
	"github.com/pricelessrabbit/nui/pkg/channels"
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
	Register(ctx context.Context, clientId, connectionId string, req <-chan *SubsReq, messages chan<- Payload) error
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

func (h *Hub[S, T]) Register(ctx context.Context, clientId, connectionId string, req <-chan []byte, messages chan<- Payload) error {
	h.purgeConnection(clientId)
	err := h.registerConnection(clientId, connectionId, req, messages)
	if err != nil {
		return err
	}
	go func() { _ = h.HandleRequests(ctx, clientId, req, messages) }()
	return nil
}

func (h *Hub[S, T]) HandleRequests(ctx context.Context, clientId string, req <-chan []byte, messages chan<- Payload) error {
	for {
	nextRequest:
		select {
		case <-ctx.Done():
			h.purgeConnection(clientId)
			return nil
		case r := <-req:
			deserialized := make(map[string]any)
			err := json.Unmarshal(r, &deserialized)
			if err != nil {
				select {
				case messages <- Error{Error: err.Error()}:
				default:
				}
				break nextRequest
			}
			val, ok := deserialized["type"]
			if !ok {
				select {
				case messages <- Error{Error: err.Error()}:
				default:
				}
				break nextRequest
			}
			switch val {
			case subReqType:
				subReq := &SubsReq{}
				err := mapstructure.Decode(deserialized["payload"], subReq)
				if err != nil {
					select {
					case messages <- Error{Error: err.Error()}:
					default:
					}
					break nextRequest
				}
				h.HandleSubRequest(ctx, clientId, subReq, messages)
			}
		}
	}
}

func (h *Hub[S, T]) HandleSubRequest(_ context.Context, clientId string, subReq *SubsReq, messages chan<- Payload) {
	h.purgeSubscriptions(clientId)
	err := h.registerSubscriptions(clientId, subReq)
	if err != nil {
		select {
		case messages <- Error{Error: err.Error()}:
		default:
		}
	}
}

func (h *Hub[S, T]) purgeConnection(clientId string) {
	currentConn, ok := h.reg[clientId]
	if ok {
		h.purgeClientSubscriptions(currentConn)
	}
	delete(h.reg, clientId)
}

func (h *Hub[S, T]) purgeSubscriptions(clientId string) {
	currentConn, ok := h.reg[clientId]
	if ok {
		h.purgeClientSubscriptions(currentConn)
	}
}

func (h *Hub[S, T]) purgeClientSubscriptions(clientConn *ClientConn[S]) {
	clientConn.UnsubscribeAll()
}

func (h *Hub[S, T]) registerConnection(clientId, connectionId string, req <-chan []byte, messages chan<- Payload) error {
	_, err := h.pool.Get(connectionId)
	if err != nil {
		return err
	}
	h.reg[clientId] = NewWClientConn[S](connectionId, req, messages)
	return nil
}

func (h *Hub[S, T]) registerSubscriptions(clientId string, req *SubsReq) error {
	clientConn, ok := h.reg[clientId]
	if !ok {
		return errors.New("no client connection found")
	}
	serverConn, err := h.pool.Get(clientConn.ConnectionId)
	if err != nil {
		return err
	}
	chans := make([]<-chan *nats.Msg, 0)
	for _, sbj := range req.Subjects {
		s := NewClientSub[S](sbj)
		sub, err := serverConn.ChanSubscribe(sbj, s.Messages)
		if err != nil {
			return err
		}
		s.Sub = sub
		chans = append(chans, s.Messages)
		clientConn.AddSubscription(s)
	}
	go parseToClientMessage(channels.FanIn(10, chans...), clientConn.Messages)
	return nil
}

func parseToClientMessage(natsMsg <-chan *nats.Msg, clientMgs chan<- Payload) {
	for {
		select {
		case msg, ok := <-natsMsg:
			if !ok {
				return
			}
			cm := &NatsMsg{
				Subject: msg.Subject,
				Payload: msg.Data,
			}
			clientMgs <- cm
		}
	}
}
