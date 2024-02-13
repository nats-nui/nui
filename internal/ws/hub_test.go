package ws

import (
	"context"
	"github.com/nats-io/nats.go"
	"github.com/pricelessrabbit/nui/internal/connection"
	"github.com/pricelessrabbit/nui/pkg/logging"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/stretchr/testify/suite"
	"testing"
	"time"
)

type mockPool struct {
	Conn *mockConnection
}

func (m *mockPool) Get(_ string) (*mockConnection, error) {
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
	Subs            map[string]*mockSubscription
	StatusChangedCh []chan connection.ConnStatusChanged
	NatsStatus      nats.Status
}

func (m *mockConnection) ChanSubscribe(subj string, ch chan *nats.Msg) (*mockSubscription, error) {
	if m.Subs == nil {
		m.Subs = make(map[string]*mockSubscription)
	}
	s := &mockSubscription{Sbj: subj, Conn: m, Ch: ch}
	m.Subs[subj] = s
	return s, nil
}

func (m *mockConnection) ObserveConnectionEvents(ctx context.Context) <-chan connection.ConnStatusChanged {
	ch := make(chan connection.ConnStatusChanged)
	m.StatusChangedCh = append(m.StatusChangedCh, ch)
	go func() {
		select {
		case <-ctx.Done():
			close(ch)
		}
	}()
	return ch
}

func (m *mockConnection) Status() nats.Status {
	return m.NatsStatus
}

type HubSuite struct {
	suite.Suite
	hub  *Hub[*mockSubscription, *mockConnection]
	pool *mockPool
	l    logging.Slogger
}

func (s *HubSuite) SetupSuite() {
	s.l = &logging.MockedLogger{}
	s.pool = &mockPool{Conn: &mockConnection{}}
	s.hub = NewHub[*mockSubscription, *mockConnection](s.pool, s.l)
}

func (s *HubSuite) TestHub_Register() {
	require.NotPanics(s.T(), func() {
		_ = s.hub.Register(context.Background(), "test", "connection", make(chan *Request), make(chan Payload))
	})
}

func (s *HubSuite) TestHub_ListenRequests() {
	req := make(chan *Request, 1)
	msg := make(chan Payload, 1)
	_ = s.hub.Register(context.Background(), "test", "connection", req, msg)

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
		r := &Request{
			Type: subReqType,
			Payload: &SubsReq{
				Subjects: []string{"sub1", "sub2"},
			},
		}
		req <- r
	}()

	var received1 *NatsMsg
	var received2 *NatsMsg

	go func() {
		_ = <-msg
		received1 = (<-msg).(*NatsMsg)
		received2 = (<-msg).(*NatsMsg)
	}()
	require.EventuallyWithT(s.T(), func(c *assert.CollectT) {
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

func (s *HubSuite) TestHub_HandleConnectionEvents() {
	req := make(chan *Request, 1)
	msg := make(chan Payload, 1)
	_ = s.hub.Register(context.Background(), "test", "connection", req, msg)

	var received1 *ConnectionStatus
	var received2 *ConnectionStatus
	var received3 *ConnectionStatus

	go func() {
		received1 = (<-msg).(*ConnectionStatus)
		received2 = (<-msg).(*ConnectionStatus)
		received3 = (<-msg).(*ConnectionStatus)
	}()

	require.EventuallyWithT(s.T(), func(c *assert.CollectT) {
		assert.NotPanics(s.T(), func() {
			s.pool.Conn.StatusChangedCh[0] <- connection.ConnStatusChanged{Status: Disconnected}
			s.pool.Conn.StatusChangedCh[0] <- connection.ConnStatusChanged{Status: Reconnected}
		})
	}, 1*time.Second, time.Millisecond*20)

	require.EventuallyWithT(s.T(), func(c *assert.CollectT) {
		assert.NotNil(c, received1)
		assert.NotNil(c, received2)
		assert.NotNil(c, received3)
		if received1 == nil || received2 == nil || received3 == nil {
			return
		}
		assert.Equal(c, received1.Status, Disconnected)
		assert.Equal(c, received2.Status, Disconnected)
		assert.Equal(c, received3.Status, Reconnected)
	}, 1*time.Second, time.Millisecond*20)
}

func TestHubSuite(t *testing.T) {
	suite.Run(t, new(HubSuite))
}
