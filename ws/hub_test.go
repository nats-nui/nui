package ws

import (
	"context"
	"github.com/nats-io/nats.go"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"testing"
	"time"
)

type mockPool struct {
	Conn *mockConnection
}

func (m *mockPool) Get(id string) (*mockConnection, error) {
	if m.Conn == nil {
		m.Conn = new(mockConnection)
	}
	return m.Conn, nil
}

type mockSubscription struct {
	Conn *mockConnection
	Sbj  string
	Ch   chan *nats.Msg
}

func (m *mockSubscription) Unsubscribe() error {
	delete(m.Conn.Subs, m.Sbj)
	return nil
}

type mockConnection struct {
	Subs map[string]*mockSubscription
}

func (m *mockConnection) ChanSubscribe(subj string, ch chan *nats.Msg) (*mockSubscription, error) {
	if m.Subs == nil {
		m.Subs = make(map[string]*mockSubscription)
	}
	s := &mockSubscription{Sbj: subj, Conn: m, Ch: ch}
	m.Subs[subj] = s
	return s, nil
}

type hubSuite struct {
	hub  *Hub[*mockSubscription, *mockConnection]
	pool *mockPool
}

func setupHubSuite() *hubSuite {
	s := &hubSuite{}
	s.pool = &mockPool{Conn: &mockConnection{}}
	s.hub = NewHub[*mockSubscription, *mockConnection](s.pool)
	return s
}

func TestHub_Register(t *testing.T) {
	s := setupHubSuite()
	require.NotPanics(t, func() {
		s.hub.Register(context.Background(), "test", make(chan *Request), make(chan StrType))
	})
}

func TestHub_ListenRequests(t *testing.T) {
	s := setupHubSuite()
	req := make(chan *Request, 1)
	msg := make(chan StrType, 1)
	s.hub.Register(context.Background(), "test", req, msg)

	go func() {
		for range time.Tick(time.Millisecond * 20) {
			s1, ok1 := s.pool.Conn.Subs["sub1"]
			s2, ok2 := s.pool.Conn.Subs["sub2"]
			if ok1 && ok2 {
				s1.Ch <- &nats.Msg{Subject: "sub1", Data: []byte("test1")}
				s2.Ch <- &nats.Msg{Subject: "sub2", Data: []byte("test2")}
				return
			}
		}
	}()

	go func() {
		req <- &Request{
			ConnectionId: "test",
			Subjects:     []string{"sub1", "sub2"},
		}
	}()

	var received1 *NatsMsg
	var received2 *NatsMsg

	go func() {
		received1 = (<-msg).(*NatsMsg)
		received2 = (<-msg).(*NatsMsg)
	}()
	require.EventuallyWithT(t, func(c *assert.CollectT) {
		assert.NotNil(c, received1)
		assert.NotNil(c, received2)
		if received1 == nil || received2 == nil {
			return
		}
		subjects := []string{received1.Subject, received2.Subject}
		assert.Contains(c, subjects, "sub1")
		assert.Contains(c, subjects, "sub2")
	}, 1*time.Second, time.Millisecond*20)

}
