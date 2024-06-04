package connection

import (
	"context"
	"github.com/nats-io/nats.go"
	"sync"
	"time"
)

type NatsConn struct {
	*nats.Conn
	connectionEventsSubs []*subscriber
	subsMutex            sync.Mutex
	eventHandleMutex     sync.Mutex
	mockMode             bool
	lastStatus           string
	lastError            error
}

type subscriber struct {
	events chan<- ConnStatusChanged
	stop   context.CancelFunc
}

func (n *NatsConn) ObserveConnectionEvents(ctx context.Context) <-chan ConnStatusChanged {
	ctx, stop := context.WithCancel(ctx)
	events := make(chan ConnStatusChanged, 5)
	sub := &subscriber{events: events, stop: stop}
	n.subsMutex.Lock()
	n.connectionEventsSubs = append(n.connectionEventsSubs, sub)
	n.subsMutex.Unlock()
	go n.listenForStop(ctx, sub)
	return events
}

func (n *NatsConn) LastEvent() (string, error) {
	return n.lastStatus, n.lastError
}

func (n *NatsConn) buildStatusHandlerWithErr(status string) nats.ConnErrHandler {
	return func(conn *nats.Conn, err error) {
		n.handleEvent(status, err)
	}
}

func (n *NatsConn) buildStatusHandler(status string) nats.ConnHandler {
	return func(conn *nats.Conn) {
		var err error
		if n.Conn.Status() != nats.CONNECTED {
			err = n.Conn.LastError()
		}
		n.handleEvent(status, err)
	}
}

func (n *NatsConn) handleEvent(status string, err error) {
	n.eventHandleMutex.Lock()
	defer n.eventHandleMutex.Unlock()
	n.lastStatus = status
	n.lastError = err
	for _, s := range n.connectionEventsSubs {
		select {
		case s.events <- ConnStatusChanged{status, err}:
		default:
		}
	}
}

func (n *NatsConn) listenForStop(ctx context.Context, s *subscriber) {
	select {
	case <-ctx.Done():
		n.removeListener(s)
	}
}

func (n *NatsConn) removeListener(toRemove *subscriber) {
	n.subsMutex.Lock()
	defer n.subsMutex.Unlock()
	for i, s := range n.connectionEventsSubs {
		if s == toRemove {
			close(s.events)
			n.connectionEventsSubs = append(n.connectionEventsSubs[:i], n.connectionEventsSubs[i+1:]...)
			return
		}
	}
}

func (n *NatsConn) Close() {
	n.subsMutex.Lock()
	defer n.subsMutex.Unlock()
	if !n.mockMode {
		n.Conn.Close()
	}
	for _, s := range n.connectionEventsSubs {
		s.stop()
	}
	n.connectionEventsSubs = nil
}

func NewNatsConn(hosts string, options ...nats.Option) (*NatsConn, error) {
	return newWithBuilder(hosts, options, buildConn, false)
}

func newMocked() (*NatsConn, error) {
	nConn, err := newWithBuilder("", nil, buildMockConn, true)
	if err != nil {
		return nil, err
	}
	nConn.SetReconnectHandler(nConn.buildStatusHandler(StatusConnected))
	nConn.SetDisconnectErrHandler(nConn.buildStatusHandlerWithErr(StatusDisconnected))
	nConn.SetClosedHandler(nConn.buildStatusHandler(StatusDisconnected))
	return nConn, nil
}

type buildFunc func(string, []nats.Option) (*nats.Conn, error)

func newWithBuilder(hosts string, options []nats.Option, builder buildFunc, mockMode bool) (*NatsConn, error) {
	nConn := &NatsConn{mockMode: mockMode}
	nConn.lastStatus = StatusDisconnected

	// NATS when in reconnect mode does not provide any error if first connection fails and no events are emitted.
	// only the state is set to RECONNECTING. To give the user a reason about the connection failure,
	// a different probe connection is used to check if the connection is possible.
	probeConn, err := builder(
		hosts,
		append(options, nats.RetryOnFailedConnect(false), nats.MaxReconnects(1), nats.MaxPingsOutstanding(1), nats.PingInterval(1*time.Second)))

	if probeConn != nil {
		if probeConn.Status() == nats.CONNECTED {
			nConn.lastStatus = StatusConnected
		}
		if err == nil {
			err = probeConn.LastError()
		}
		if !mockMode {
			probeConn.Close()
		}
	}
	nConn.lastError = err

	// After probing and saving the status and error, the long-term connection is established.

	// add options to manage the connection events
	options = append(options, nats.ConnectHandler(nConn.buildStatusHandler(StatusConnected)))
	options = append(options, nats.ReconnectHandler(nConn.buildStatusHandler(StatusConnected)))
	options = append(options, nats.DisconnectErrHandler(nConn.buildStatusHandlerWithErr(StatusDisconnected)))

	// create the long-term connection
	natsConn, err := builder(hosts, options)
	if err != nil {
		return nil, err
	}
	nConn.Conn = natsConn

	return nConn, nil
}

func buildConn(hosts string, options []nats.Option) (*nats.Conn, error) {
	return nats.Connect(hosts, options...)
}

func buildMockConn(_ string, _ []nats.Option) (*nats.Conn, error) { return &nats.Conn{}, nil }
