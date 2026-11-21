package connection

import (
	"context"
	"sync"
	"testing"
	"time"

	"github.com/nats-io/nats.go"
	"github.com/stretchr/testify/require"
)

func TestNatsConn_ObserveConnectionEvents(t *testing.T) {
	nconn, err := newMocked()
	require.NoError(t, err)
	t.Cleanup(nconn.Close)

	status, err := nconn.LastEvent()
	require.NoError(t, err)
	require.Equal(t, StatusDisconnected, status)

	first := nconn.ObserveConnectionEvents(t.Context())
	ctx, cancel := context.WithCancel(t.Context())
	defer cancel()
	second := nconn.ObserveConnectionEvents(ctx)

	nconn.DisconnectErrHandler()(nconn.Conn, nil)
	nconn.ReconnectHandler()(nconn.Conn)
	for _, events := range []<-chan ConnStatusChanged{first, second} {
		require.Len(t, events, 2)
		require.Equal(t, StatusDisconnected, (<-events).Status)
		require.Equal(t, StatusConnected, (<-events).Status)
	}

	cancel()
	requireObserverClosed(t, second)
	nconn.ClosedHandler()(nconn.Conn)
	require.Len(t, first, 1)
	require.Equal(t, StatusDisconnected, (<-first).Status)
	nconn.Close()
	requireObserverClosed(t, first)
	requireObserverClosed(t, nconn.ObserveConnectionEvents(t.Context()))
}

func requireObserverClosed(t *testing.T, events <-chan ConnStatusChanged) {
	t.Helper()
	select {
	case _, ok := <-events:
		require.False(t, ok)
	case <-time.After(time.Second):
		t.Fatal("connection event channel did not close")
	}
}

func TestNatsConn_StatusHandlerUsesCallbackConnection(t *testing.T) {
	// ConnectHandler can run before the builder returns the connection.
	nconn := &NatsConn{}
	nconn.buildStatusHandler(StatusConnected)(&nats.Conn{})
	status, err := nconn.LastEvent()
	require.NoError(t, err)
	require.Equal(t, StatusConnected, status)
}

func TestNatsConn_ConcurrentConnectionEvents(t *testing.T) {
	nconn, err := newMocked()
	require.NoError(t, err)
	t.Cleanup(nconn.Close)

	var workers sync.WaitGroup
	workers.Go(func() {
		for range 100 {
			nconn.handleEvent(StatusConnected, nil)
		}
	})
	for range 100 {
		ctx, cancel := context.WithCancel(t.Context())
		nconn.ObserveConnectionEvents(ctx)
		nconn.LastEvent()
		cancel()
	}
	nconn.Close()
	workers.Wait()
}
