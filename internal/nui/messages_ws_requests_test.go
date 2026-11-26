package nui

import (
	"context"
	"net"
	"testing"
	"testing/synctest"
	"time"

	clientws "github.com/fasthttp/websocket"
	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
	"github.com/nats-nui/nui/internal/ws"
	"github.com/stretchr/testify/require"
)

func TestHandleWsRequestPreservesQueuedSelections(t *testing.T) {
	synctest.Test(t, testQueuedSelections)
}

func testQueuedSelections(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	requests := make(chan *ws.Request, 1)
	app := fiber.New()
	app.Get("/", websocket.New(func(c *websocket.Conn) {
		HandleWsRequest(c, ctx, requests, cancel)
	}))
	app.Server().Handler = app.Handler()
	app.Server().NoDefaultDate = true
	server, peer := net.Pipe()
	defer peer.Close()
	go func() { _ = app.Server().ServeConn(server) }()

	dialer := clientws.Dialer{
		NetDial:          func(_, _ string) (net.Conn, error) { return peer, nil },
		HandshakeTimeout: time.Second,
	}
	client, _, err := dialer.Dial("ws://localhost/", nil)
	require.NoError(t, err)
	require.NoError(t, client.SetWriteDeadline(time.Now().Add(time.Second)))
	selections := []string{"orders.created", "orders.shipped"}
	for _, subject := range selections {
		require.NoError(t, client.WriteJSON(ws.Request{
			Type:    "subscriptions_req",
			Payload: ws.SubsReq{Subjects: []string{subject}},
		}))
	}

	// Drain the full queue one request at a time.
	for _, subject := range selections {
		synctest.Wait()
		require.Len(t, requests, 1)
		require.Equal(t, map[string]any{"subjects": []any{subject}}, (<-requests).Payload)
	}
}
