package ws

import "sync"

type ClientConn[S Subscription] struct {
	Req      <-chan Request
	Messages chan<- StrType
	Subs     []ClientSub[S]
	l        sync.Mutex
}

func (c *ClientConn[S]) UnsubscribeAll() {
	c.l.Lock()
	defer c.l.Unlock()
	for _, sub := range c.Subs {
		_ = sub.Sub.Unsubscribe()
		close(sub.Messages)
	}
}

func NewWClientConn[S Subscription](messages chan<- StrType, subs []ClientSub[S]) *ClientConn[S] {
	return &ClientConn[S]{
		Messages: messages,
		Subs:     subs,
	}
}
