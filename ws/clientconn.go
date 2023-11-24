package ws

import "sync"

type ClientConn[S Subscription] struct {
	ConnectionId string
	Req          <-chan *SubsReq
	Messages     chan<- Payload
	Subs         []ClientSub[S]
	l            sync.Mutex
}

func (c *ClientConn[S]) UnsubscribeAll() {
	c.l.Lock()
	defer c.l.Unlock()
	for _, sub := range c.Subs {
		_ = sub.Sub.Unsubscribe()
		close(sub.Messages)
	}
	c.Subs = []ClientSub[S]{}
}

func (c *ClientConn[S]) AddSubscription(subscription ClientSub[S]) {
	c.l.Lock()
	defer c.l.Unlock()
	c.Subs = append(c.Subs, subscription)
}

func NewWClientConn[S Subscription](connectionId string, req <-chan *SubsReq, messages chan<- Payload) *ClientConn[S] {
	return &ClientConn[S]{
		ConnectionId: connectionId,
		Req:          req,
		Messages:     messages,
		Subs:         []ClientSub[S]{},
	}
}
