package nui

import (
	"context"
	"io"
	"net/http"
	"testing"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/nats-nui/nui/pkg/logging"
	"github.com/stretchr/testify/require"
)

func TestStartWaitsForActiveRequest(t *testing.T) {
	server := NewServer("0", nil, &logging.NullLogger{}, false)
	addr := make(chan string, 1)
	server.Hooks().OnListen(func(data fiber.ListenData) error {
		addr <- "http://127.0.0.1:" + data.Port
		return nil
	})
	ctx, cancel := context.WithTimeout(t.Context(), 3*time.Second)
	defer cancel()
	handled, stopped := make(chan struct{}), make(chan struct{})
	server.Get("/test-shutdown", func(c *fiber.Ctx) error {
		cancel()
		select {
		case <-c.Context().Done(): // fasthttp has begun draining active requests.
			defer close(handled)
			return c.SendString("done")
		case <-stopped:
			return c.SendStatus(http.StatusServiceUnavailable)
		}
	})
	var startErr error
	var drained bool
	go func() {
		startErr = server.Start(ctx)
		select {
		case <-handled:
			drained = true
		default:
		}
		close(stopped)
	}()

	var url string
	select {
	case url = <-addr:
	case <-stopped:
		t.Fatalf("server stopped before listening: %v", startErr)
	case <-ctx.Done():
		t.Fatal("listener did not start")
	}
	resp, err := (&http.Client{Timeout: 4 * time.Second}).Get(url + "/test-shutdown")
	require.NoError(t, err)
	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	require.NoError(t, err)
	require.Equal(t, http.StatusOK, resp.StatusCode)
	require.Equal(t, "done", string(body))
	select {
	case <-stopped:
		require.NoError(t, startErr)
		require.True(t, drained, "server returned with an active request")
	case <-time.After(2 * time.Second):
		t.Fatal("server did not stop")
	}
}

func TestStartCanceledBeforeServing(t *testing.T) {
	server := NewServer("0", nil, &logging.NullLogger{}, false)
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	server.Hooks().OnListen(func(fiber.ListenData) error {
		cancel()
		return nil
	})
	done := make(chan error, 1)
	go func() { done <- server.Start(ctx) }()
	select {
	case err := <-done:
		require.NoError(t, err)
	case <-time.After(time.Second):
		t.Fatal("server started listening after cancellation")
	}
}
