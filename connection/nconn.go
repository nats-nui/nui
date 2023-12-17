package connection

import (
	"context"
	"github.com/nats-io/nats.go"
	"sync"
)

type subscriber struct {
	events chan<- ConnStatusChanged
	stop   context.CancelFunc
}

type NatsConn struct {
	*nats.Conn
	connectionEventsSubs []*subscriber
	subsMutex            sync.Mutex
	mockMode             bool
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

func (n *NatsConn) buildStatusHandlerWithErr(status string) nats.ConnErrHandler {
	return func(conn *nats.Conn, err error) {
		n.handleEvent(status, err)
	}
}

func (n *NatsConn) buildStatusHandler(status string) nats.ConnHandler {
	return func(conn *nats.Conn) {
		n.handleEvent(status, nil)
	}
}

func (n *NatsConn) handleEvent(status string, err error) {
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
	return newWithBuilder("", nil, buildMockConn, true)
}

type buildFunc func(string, []nats.Option) (*nats.Conn, error)

func newWithBuilder(hosts string, options []nats.Option, builder buildFunc, mockMode bool) (*NatsConn, error) {
	natsConn, err := builder(hosts, options)
	if err != nil {
		return nil, err
	}
	nConn := &NatsConn{Conn: natsConn, mockMode: mockMode}
	natsConn.SetDisconnectErrHandler(nConn.buildStatusHandlerWithErr("disconnected"))
	natsConn.SetReconnectHandler(nConn.buildStatusHandler("reconnected"))
	natsConn.SetClosedHandler(nConn.buildStatusHandler("closed"))

	return nConn, nil
}

func buildConn(hosts string, options []nats.Option) (*nats.Conn, error) {
	return nats.Connect(hosts, options...)
}

func buildMockConn(_ string, _ []nats.Option) (*nats.Conn, error) {
	return &nats.Conn{}, nil
}
