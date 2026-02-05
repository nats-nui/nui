package ws

import (
	"sync/atomic"
	"time"

	"github.com/nats-io/nats.go"
)

type ClientSub[S Subscription] struct {
	Subject      string
	Messages     chan *nats.Msg
	Sub          S
	CreatedAt    time.Time
	TTLMinutes   int
	MaxMessages  int
	MessageCount atomic.Int64
	Expired      atomic.Bool
}

func NewClientSub[S Subscription](subject string, ttlMinutes, maxMessages int) ClientSub[S] {
	return ClientSub[S]{
		Subject:     subject,
		Messages:    make(chan *nats.Msg, 10),
		CreatedAt:   time.Now(),
		TTLMinutes:  ttlMinutes,
		MaxMessages: maxMessages,
	}
}

// IncrementMessageCount increments the message counter and returns true if max messages exceeded
func (c *ClientSub[S]) IncrementMessageCount() bool {
	count := c.MessageCount.Add(1)
	if c.MaxMessages > 0 && int(count) >= c.MaxMessages {
		return true
	}
	return false
}

// IsExpired checks if the subscription has expired due to TTL
func (c *ClientSub[S]) IsExpired() bool {
	if c.Expired.Load() {
		return true
	}
	if c.TTLMinutes > 0 {
		expiryTime := c.CreatedAt.Add(time.Duration(c.TTLMinutes) * time.Minute)
		return time.Now().After(expiryTime)
	}
	return false
}

// MarkExpired marks the subscription as expired
func (c *ClientSub[S]) MarkExpired() {
	c.Expired.Store(true)
}
