package ws

import (
	"context"
	"sync"
	"time"
)

type CachedMetrics struct {
	Data      map[string]map[string]any
	CachedAt  time.Time
	CacheTTL  time.Duration
}

func (c *CachedMetrics) IsValid() bool {
	if c.Data == nil {
		return false
	}
	return time.Since(c.CachedAt) < c.CacheTTL
}

type ClientConn[S Subscription] struct {
	ConnectionId   string
	Req            <-chan *Request
	Messages       chan<- Payload
	Subs           []ClientSub[S]
	l              sync.Mutex
	MetricsCancel  context.CancelFunc
	CachedMetrics  *CachedMetrics
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

func NewWClientConn[S Subscription](connectionId string, req <-chan *Request, messages chan<- Payload) *ClientConn[S] {
	return &ClientConn[S]{
		ConnectionId: connectionId,
		Req:          req,
		Messages:     messages,
		Subs:         []ClientSub[S]{},
		CachedMetrics: &CachedMetrics{
			CacheTTL: 30 * time.Second,
		},
	}
}

func (c *ClientConn[S]) UpdateMetricsCache(data map[string]map[string]any) {
	c.l.Lock()
	defer c.l.Unlock()
	c.CachedMetrics.Data = data
	c.CachedMetrics.CachedAt = time.Now()
}

func (c *ClientConn[S]) GetCachedMetrics() map[string]map[string]any {
	c.l.Lock()
	defer c.l.Unlock()
	if c.CachedMetrics.IsValid() {
		return c.CachedMetrics.Data
	}
	return nil
}
