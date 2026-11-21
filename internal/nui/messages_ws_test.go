package nui

import (
	"context"
	"log/slog"
	"net"
	"os"
	"sync"
	"sync/atomic"
	"testing"
	"time"

	"github.com/fasthttp/websocket"
	"github.com/nats-nui/nui/internal/connection"
	"github.com/nats-nui/nui/internal/ws"
	"github.com/stretchr/testify/require"
)

type wsTestRepo struct{ connection.ConnRepo }

func (wsTestRepo) GetById(id string) (*connection.Connection, error) {
	return &connection.Connection{Id: id}, nil
}

type wsTestHub struct{ registered chan chan<- ws.Payload }

func (h wsTestHub) Register(_ context.Context, _, _ string, _ <-chan *ws.Request, messages chan<- ws.Payload) error {
	h.registered <- messages
	return nil
}

type wsTestConn struct {
	net.Conn
	watchWrite               atomic.Bool
	writing, expired, closed chan struct{}
	writeErr                 chan error
	writeErrAtClose          error
}

func (c *wsTestConn) Write(p []byte) (int, error) {
	if !c.watchWrite.Swap(false) {
		return c.Conn.Write(p)
	}
	close(c.writing)
	n, err := c.Conn.Write(p)
	c.writeErr <- err
	return n, err
}

func (c *wsTestConn) SetDeadline(at time.Time) error {
	err := c.Conn.SetDeadline(at)
	if !at.IsZero() && !at.After(time.Now()) {
		close(c.expired)
	}
	return err
}

func (c *wsTestConn) Close() error {
	select {
	case c.writeErrAtClose = <-c.writeErr:
	default:
	}
	close(c.closed)
	return c.Conn.Close()
}

func wsTestWait[T any](t *testing.T, ch <-chan T) T {
	t.Helper()
	select {
	case v := <-ch:
		return v
	case <-time.After(3 * time.Second):
		t.Fatal("timed out waiting for websocket")
		var zero T
		return zero
	}
}

func newWsTestClient(t *testing.T, query string) (*websocket.Conn, *wsTestConn, wsTestHub, context.CancelFunc) {
	t.Helper()
	ctx, cancel := context.WithCancel(context.Background())
	t.Cleanup(cancel)
	hub := wsTestHub{registered: make(chan chan<- ws.Payload, 1)}
	app := NewServer("", &Nui{ConnRepo: wsTestRepo{}, Hub: hub}, slog.Default(), false)
	app.ctx = ctx
	app.Server().Handler = app.Handler()
	server, peer := net.Pipe()
	t.Cleanup(func() { _ = peer.Close() })
	socket := &wsTestConn{Conn: server, writing: make(chan struct{}), expired: make(chan struct{}), closed: make(chan struct{}), writeErr: make(chan error, 1)}
	served := make(chan error, 1)
	go func() { served <- app.Server().ServeConn(socket) }()
	dialer := websocket.Dialer{NetDial: func(_, _ string) (net.Conn, error) { return peer, nil }, HandshakeTimeout: time.Second}
	client, _, err := dialer.Dial("ws://localhost/ws/sub"+query, nil)
	require.NoError(t, err)
	require.NoError(t, wsTestWait(t, served))
	return client, socket, hub, cancel
}

type wsTestPayload struct{ encoding, release chan struct{} }

func (wsTestPayload) GetType() string { return "test" }
func (p wsTestPayload) MarshalJSON() ([]byte, error) {
	close(p.encoding)
	<-p.release
	return []byte("{}"), nil
}

func TestHandleWsSubShutdown(t *testing.T) {
	for _, name := range []string{"blocked write", "encoding"} {
		t.Run(name, func(t *testing.T) {
			_, socket, hub, cancel := newWsTestClient(t, "?id=test")
			messages := wsTestWait(t, hub.registered)
			payload := wsTestPayload{make(chan struct{}), make(chan struct{})}
			release := sync.OnceFunc(func() { close(payload.release) })
			t.Cleanup(release)
			messages <- payload
			wsTestWait(t, payload.encoding)
			socket.watchWrite.Store(true)
			if name == "blocked write" {
				release()
				wsTestWait(t, socket.writing)
				cancel()
			} else {
				cancel()
				wsTestWait(t, socket.expired)
				release()
			}
			// A deadline must release the blocked write before fasthttp closes the pipe.
			wsTestWait(t, socket.closed)
			require.ErrorIs(t, socket.writeErrAtClose, os.ErrDeadlineExceeded)
		})
	}
}

func TestHandleWsSubClose(t *testing.T) {
	for _, tt := range []struct {
		name, query string
		code        int
	}{
		{"missing id", "", 4422},
		{"invalid JSON", "?id=test", 4422},
		{"normal close", "?id=test", websocket.CloseNormalClosure},
	} {
		t.Run(tt.name, func(t *testing.T) {
			client, socket, _, _ := newWsTestClient(t, tt.query)
			require.NoError(t, client.SetWriteDeadline(time.Now().Add(time.Second)))
			switch tt.name {
			case "invalid JSON":
				require.NoError(t, client.WriteMessage(websocket.TextMessage, []byte("{invalid")))
			case "normal close":
				require.NoError(t, client.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(tt.code, "")))
			}
			require.NoError(t, client.SetReadDeadline(time.Now().Add(time.Second)))
			_, _, err := client.ReadMessage()
			require.True(t, websocket.IsCloseError(err, tt.code), "unexpected close: %v", err)
			wsTestWait(t, socket.closed)
		})
	}
}
