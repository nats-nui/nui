package ws

import (
	"context"
	"github.com/nats-io/nats.go"
	"github.com/nats-nui/nui/internal/connection"
	"github.com/nats-nui/nui/internal/metrics"
	"github.com/nats-nui/nui/pkg/logging"
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
	LastEventData   string
	LastErrorData   error
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

func (m *mockConnection) LastEvent() (string, error) {
	return m.LastEventData, m.LastErrorData
}

type mockMetricsService struct {
	metrics   <-chan metrics.Metrics
	c         chan metrics.Metrics
	ctxClosed bool
}

func (m *mockMetricsService) sendMetrics() {
	select {
	case m.c <- metrics.Metrics{}:
	default:
	}
}

func (m *mockMetricsService) Start(ctx context.Context, cfg metrics.ServiceCfg) (<-chan metrics.Metrics, error) {
	m.c = make(chan metrics.Metrics, 1)
	go func() {
		<-ctx.Done()
		m.ctxClosed = true
	}()
	return m.c, nil
}

type HubSuite struct {
	suite.Suite
	hub     *Hub[*mockSubscription, *mockConnection]
	pool    *mockPool
	metrics *mockMetricsService
	l       logging.Slogger
}

func (s *HubSuite) SetupSuite() {
	s.l = &logging.NullLogger{}
	s.pool = &mockPool{Conn: &mockConnection{LastEventData: Disconnected}}
}

func (s *HubSuite) SetupTest() {
	s.metrics = &mockMetricsService{}
	s.hub = NewHub[*mockSubscription, *mockConnection](s.pool, s.metrics, s.l)
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
		assert.Equal(c, Disconnected, received1.Status)
		assert.Equal(c, Disconnected, received2.Status)
		assert.Equal(c, Reconnected, received3.Status)
	}, 1*time.Second, time.Millisecond*20)
}

func (s *HubSuite) TestHub_HandleMetrics() {
	req := make(chan *Request, 1)
	msg := make(chan Payload, 1)
	// Skip the initial connection status to get only the metrics response
	s.hub.skipLastConnectionStatus = true
	_ = s.hub.Register(context.Background(), "test", "connection", req, msg)

	var received1 *MetricsResp

	// wait for the first metrics response
	go func() {
		received1 = (<-msg).(*MetricsResp)
	}()

	// Send a metrics request
	go func() {
		r := &Request{
			Type: metricsReqType,
			Payload: &MetricsReq{
				Enabled: true,
			},
		}
		req <- r
	}()

	// check that metrics received by service is relayed in the message channel
	require.EventuallyWithT(s.T(), func(c *assert.CollectT) {
		s.metrics.sendMetrics()
		assert.NotNil(c, received1)
	}, 1*time.Second, time.Millisecond*20)

	// send request to disable metrics
	go func() {
		r := &Request{
			Type: metricsReqType,
			Payload: &MetricsReq{
				Enabled: false,
			},
		}
		req <- r
	}()

	// check that metrics service context is closed
	require.EventuallyWithT(s.T(), func(c *assert.CollectT) {
		assert.True(c, s.metrics.ctxClosed)
	}, 1*time.Second, time.Millisecond*20)

}

func (s *HubSuite) TestHub_HandleMetricsOnContextDone() {
	req := make(chan *Request, 1)
	msg := make(chan Payload, 1)

	// register new connection to simulate a closed socket
	ctx, cancel := context.WithCancel(context.Background())

	// Skip the initial connection status to get only the metrics response
	s.hub.skipLastConnectionStatus = true
	_ = s.hub.Register(ctx, "test", "connection", req, msg)

	// send request to enable metrics
	r := &Request{
		Type: metricsReqType,
		Payload: &MetricsReq{
			Enabled: true,
		},
	}
	req <- r

	// simulate closed ws to check metrics context is closed
	require.EventuallyWithT(s.T(), func(c *assert.CollectT) {
		cancel()
		assert.True(c, s.metrics.ctxClosed)
	}, 1*time.Second, time.Millisecond*20)

}

func TestHubSuite(t *testing.T) {
	suite.Run(t, new(HubSuite))
}
