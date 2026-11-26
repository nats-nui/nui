package nui

import (
	"context"
	"encoding/json"
	"io"
	"log/slog"
	"net"
	"net/http"
	"net/http/httptest"
	"net/url"
	"testing"
	"time"

	"github.com/nats-io/nats.go/jetstream"
	"github.com/nats-nui/nui/internal/connection"
	"github.com/nats-nui/nui/internal/ws"
	"github.com/stretchr/testify/require"
)

func TestDiscoveryStreamMessagesLiteralSubjects(t *testing.T) {
	ns := startTestNATS(t, jsOpts(t))
	repo := connection.NewMemConnRepo()
	_, err := repo.Save(&connection.Connection{Id: "id", Hosts: []string{ns.ClientURL()}})
	require.NoError(t, err)
	pool := connection.NewNatsConnPool(repo)
	conn, err := pool.Get("id")
	require.NoError(t, err)
	defer conn.Close()
	js, err := jetstream.New(conn.Conn)
	require.NoError(t, err)
	_, err = js.CreateStream(context.Background(), jetstream.StreamConfig{Name: "ORDERS", Subjects: []string{"orders.>"}, Storage: jetstream.MemoryStorage})
	require.NoError(t, err)
	app := NewServer("0", &Nui{ConnRepo: repo, ConnPool: pool}, slog.New(slog.NewTextHandler(io.Discard, nil)), false)
	subjects := []string{"orders.a*b", "orders.a>b", "orders.a,b", "orders.a", "orders.b"}
	for _, subject := range subjects {
		_, err = js.Publish(context.Background(), subject, []byte(subject))
		require.NoError(t, err)
	}
	const path = "/api/connection/id/stream/ORDERS"
	getJSON := func(url string, dst any) {
		t.Helper()
		response, err := app.Test(httptest.NewRequest(http.MethodGet, url, nil))
		require.NoError(t, err)
		defer response.Body.Close()
		require.Equal(t, http.StatusOK, response.StatusCode)
		require.NoError(t, json.NewDecoder(response.Body).Decode(dst))
	}
	for _, subject := range subjects {
		query := "?subject=" + url.QueryEscape(subject)
		var info jetstream.StreamInfo
		getJSON(path+query, &info)
		require.Equal(t, map[string]uint64{subject: 1}, info.State.Subjects)
		var messages []ws.NatsMsg
		getJSON(path+"/messages"+query+"&seq_start=1", &messages)
		require.Len(t, messages, 1)
		require.Equal(t, subject, messages[0].Subject)
	}
	for _, query := range []string{"subject=orders.a&subject=orders.b", "subjects=orders.a,orders.b"} {
		var messages []ws.NatsMsg
		getJSON(path+"/messages?seq_start=1&"+query, &messages)
		require.Len(t, messages, 2)
		require.Equal(t, "orders.a", messages[0].Subject)
		require.Equal(t, "orders.b", messages[1].Subject)
	}
}

func TestDiscoveryAcquisitionDeadline(t *testing.T) {
	listener, err := net.Listen("tcp4", "127.0.0.1:0")
	require.NoError(t, err)
	defer listener.Close()
	repo := connection.NewMemConnRepo()
	_, err = repo.Save(&connection.Connection{Id: "id", Hosts: []string{listener.Addr().String()}})
	require.NoError(t, err)
	app := NewServer("0", &Nui{ConnRepo: repo}, slog.New(slog.NewTextHandler(io.Discard, nil)), false)
	ctx, cancel := context.WithTimeout(context.Background(), 300*time.Millisecond)
	defer cancel()
	done := make(chan error, 1)
	go func() {
		js, err := app.discoveryJetStream(ctx, "id")
		if js != nil {
			js.Conn().Close()
		}
		done <- err
	}()
	require.NoError(t, listener.(*net.TCPListener).SetDeadline(time.Now().Add(time.Second)))
	peer, err := listener.Accept()
	require.NoError(t, err)
	defer peer.Close()
	require.NoError(t, peer.SetReadDeadline(time.Now().Add(time.Second)))
	_, err = peer.Read(make([]byte, 1))
	require.ErrorIs(t, err, io.EOF)
	require.ErrorIs(t, <-done, context.DeadlineExceeded)
}

func TestDiscoveryAfterServerCancellation(t *testing.T) {
	ns := startTestNATS(t, jsOpts(t))
	repo := connection.NewMemConnRepo()
	_, err := repo.Save(&connection.Connection{Id: "id", Hosts: []string{ns.ClientURL()}})
	require.NoError(t, err)
	app := NewServer("0", &Nui{ConnRepo: repo}, slog.New(slog.NewTextHandler(io.Discard, nil)), false)
	ctx, cancel := context.WithCancel(context.Background())
	app.ctx = ctx
	cancel()

	for _, path := range []string{"core?filter=orders", "jetstream", "jetstream/ORDERS/occupied"} {
		resp, err := app.Test(httptest.NewRequest(http.MethodGet, "/api/connection/id/subjects/"+path, nil))
		require.NoError(t, err)
		body, err := io.ReadAll(resp.Body)
		resp.Body.Close()
		require.NoError(t, err)
		require.Contains(t, string(body), "interrupted", path)
	}
	stats, err := ns.Varz(nil)
	require.NoError(t, err)
	require.Zero(t, stats.TotalConnections)
}
