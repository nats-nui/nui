package ws

import (
	"context"
	"sync"
	"time"
)

// MaxSubscriptionsPerUser is the limit of active subscriptions per user
const MaxSubscriptionsPerUser = 10

// DisconnectGracePeriod is the time to wait before cleaning up subscriptions on disconnect
const DisconnectGracePeriod = 30 * time.Second

type ClientConn[S Subscription] struct {
	ConnectionId     string
	Req              <-chan *Request
	Messages         chan<- Payload
	Subs             []ClientSub[S]
	l                sync.Mutex
	MetricsCancel    context.CancelFunc
	ParserCancel     context.CancelFunc
	TTLCheckerCancel context.CancelFunc
	TTLMinutes       int  // Default TTL for subscriptions
	MaxMessages      int  // Default max messages for subscriptions
	SessionBased     bool // Whether to remove subscriptions on disconnect
	DisconnectTimer  *time.Timer
	UserID           string // For tracking per-user limits
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
		TTLMinutes:   15,   // Default 15 minutes
		MaxMessages:  1000, // Default 1000 messages
		SessionBased: true, // Default remove on disconnect
	}
}

// SubscriptionCount returns the current number of active subscriptions
func (c *ClientConn[S]) SubscriptionCount() int {
	c.l.Lock()
	defer c.l.Unlock()
	return len(c.Subs)
}

// CanAddSubscription checks if more subscriptions can be added (within limit)
func (c *ClientConn[S]) CanAddSubscription(count int) bool {
	c.l.Lock()
	defer c.l.Unlock()
	return len(c.Subs)+count <= MaxSubscriptionsPerUser
}

// RemoveExpiredSubscriptions removes subscriptions that have expired and returns them
func (c *ClientConn[S]) RemoveExpiredSubscriptions() []ClientSub[S] {
	c.l.Lock()
	defer c.l.Unlock()

	var expired []ClientSub[S]
	var active []ClientSub[S]

	for _, sub := range c.Subs {
		if sub.IsExpired() {
			_ = sub.Sub.Unsubscribe()
			close(sub.Messages)
			expired = append(expired, sub)
		} else {
			active = append(active, sub)
		}
	}

	c.Subs = active
	return expired
}

// RemoveSubscription removes a subscription by subject and closes its channel
func (c *ClientConn[S]) RemoveSubscription(subject string) {
	c.l.Lock()
	defer c.l.Unlock()

	var active []ClientSub[S]
	for _, sub := range c.Subs {
		if sub.Subject == subject {
			close(sub.Messages)
		} else {
			active = append(active, sub)
		}
	}
	c.Subs = active
}

// SetSubscriptionOptions sets the default options for new subscriptions
func (c *ClientConn[S]) SetSubscriptionOptions(ttlMinutes, maxMessages int, sessionBased bool) {
	c.l.Lock()
	defer c.l.Unlock()
	if ttlMinutes > 0 {
		c.TTLMinutes = ttlMinutes
	}
	if maxMessages > 0 {
		c.MaxMessages = maxMessages
	}
	c.SessionBased = sessionBased
}
