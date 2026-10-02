package nui

import (
	"context"
	"encoding/json"
	"io"
	"net"
	"strconv"
	"sync"
	"testing"
	"time"

	"github.com/nats-io/nats-server/v2/server"
	"github.com/nats-io/nats.go"
	"github.com/nats-io/nats.go/jetstream"
	"github.com/nats-nui/nui/internal/connection"
	"github.com/stretchr/testify/require"
)

func watchSnapshot(t *testing.T, h *coreWatchHub, id, filter string, cfg *connection.Connection, discardSys bool, owner string) *CoreCatalog {
	t.Helper()
	out, err := h.snapshot(id, filter, func() (*connection.Connection, error) { return cfg, nil }, discardSys, owner)
	require.NoError(t, err)
	return out
}

func TestCoreWatchConcurrentStart(t *testing.T) {
	ns := startTestNATS(t, nil)
	cfg := &connection.Connection{Hosts: []string{ns.ClientURL()}}
	h := newCoreWatchHub()
	defer h.close()
	var wg sync.WaitGroup
	for i := 0; i < 20; i++ {
		wg.Add(1)
		go func() { defer wg.Done(); watchSnapshot(t, h, "id", "orders.>", cfg, true, "card") }()
	}
	wg.Wait()
	require.Equal(t, 1, ns.NumClients())
	h.stop("id")
	require.Eventually(t, func() bool { return ns.NumClients() == 0 }, time.Second, time.Millisecond)
}

func TestCoreWatchPendingDial(t *testing.T) {
	for _, tc := range []struct {
		name   string
		scheme string
		stop   bool
		reply  string
	}{
		{"stop", "nats://", true, ""},
		{"timeout", "wss://", false, ""},
		{"invalid upgrade", "ws://", false, "HTTP/1.1 200 OK\r\nContent-Length: 0\r\n\r\n"},
	} {
		t.Run(tc.name, func(t *testing.T) {
			listener, err := net.Listen("tcp", "127.0.0.1:0")
			require.NoError(t, err)
			defer listener.Close()
			accepted := make(chan net.Conn, 1)
			go func() {
				client, err := listener.Accept()
				if err == nil {
					if tc.reply != "" {
						_, _ = io.WriteString(client, tc.reply)
					}
					accepted <- client
				}
			}()
			h := newCoreWatchHub()
			defer h.close()
			done := make(chan *CoreCatalog, 1)
			go func() {
				done <- watchSnapshot(t, h, "id", "orders.>", &connection.Connection{Hosts: []string{tc.scheme + listener.Addr().String()}}, true, "card")
			}()
			var client net.Conn
			select {
			case client = <-accepted:
				defer client.Close()
			case <-time.After(time.Second):
				t.Fatal("dial did not start")
			}
			wait := nats.DefaultTimeout + time.Second
			if tc.stop {
				h.stopSession("id", "card")
				wait = 500 * time.Millisecond
			}
			select {
			case out := <-done:
				require.False(t, out.Watching)
				if !tc.stop {
					require.NotEmpty(t, out.Error)
				}
			case <-time.After(wait):
				t.Fatal("pending dial did not finish")
			}
			if tc.stop {
				require.Nil(t, h.read("id", "card"))
			}
			require.NoError(t, client.SetReadDeadline(time.Now().Add(time.Second)))
			_, err = io.Copy(io.Discard, client)
			require.NoError(t, err)
		})
	}
}

func TestCoreWatchOwnership(t *testing.T) {
	for _, filter := range []string{"orders.>", "other.>"} {
		t.Run(filter, func(t *testing.T) {
			ns := startTestNATS(t, nil)
			cfg := &connection.Connection{Hosts: []string{ns.ClientURL()}}
			h := newCoreWatchHub()
			defer h.close()
			require.True(t, watchSnapshot(t, h, "id", "orders.>", cfg, true, "first").Watching)
			require.True(t, watchSnapshot(t, h, "id", filter, cfg, true, "second").Watching)
			h.stopSession("id", "first")
			require.Nil(t, h.read("id", "first"))
			current := h.read("id", "second")
			require.NotNil(t, current)
			require.True(t, current.Watching)
			h.close()
			require.False(t, watchSnapshot(t, h, "id", ">", cfg, true, "second").Watching)
			require.Eventually(t, func() bool { return ns.NumClients() == 0 }, time.Second, time.Millisecond)
		})
	}
}

func TestCoreWatchPermissionAndDisconnect(t *testing.T) {
	ns := startTestNATS(t, &server.Options{Host: "127.0.0.1", Port: -1, NoLog: true, NoSigs: true,
		Users: []*server.User{{Username: "limited", Password: "test", Permissions: &server.Permissions{Subscribe: &server.SubjectPermission{Allow: []string{"orders.>"}}}}},
	})
	cfg := &connection.Connection{Hosts: []string{ns.ClientURL()}, Auth: []connection.Auth{{Active: true, Mode: connection.AuthModeUserPassword, Username: "limited", Password: "test"}}}
	h := newCoreWatchHub()
	defer h.close()
	watchSnapshot(t, h, "id", "secret.>", cfg, true, "")
	require.Eventually(t, func() bool { out := h.read("id", ""); return out.Error == "not allowed" && !out.Watching }, time.Second, time.Millisecond)
	require.True(t, watchSnapshot(t, h, "id", "orders.>", cfg, true, "").Watching)
	ns.Shutdown()
	require.Eventually(t, func() bool { out := h.read("id", ""); return out.Error != "" && !out.Watching }, time.Second, time.Millisecond)
}

func TestCoreWatchStopsAtNameCap(t *testing.T) {
	ns := startTestNATS(t, nil)
	h := newCoreWatchHub()
	defer h.close()
	cfg := &connection.Connection{Hosts: []string{ns.ClientURL()}}
	require.True(t, watchSnapshot(t, h, "id", "cap.>", cfg, true, "").Watching)
	pub, err := nats.Connect(ns.ClientURL())
	require.NoError(t, err)
	defer pub.Close()
	for i := 0; i <= maxCoreSubjects; i++ {
		require.NoError(t, pub.Publish("cap."+strconv.Itoa(i), nil))
		if i%100 == 0 {
			require.NoError(t, pub.Flush())
			time.Sleep(time.Millisecond)
		}
	}
	require.NoError(t, pub.Flush())
	require.Eventually(t, func() bool { return !h.read("id", "").Watching }, time.Second, time.Millisecond)
	out := h.read("id", "")
	require.True(t, out.Truncated, out.Error)
	require.Len(t, out.Subjects, maxCoreSubjects)
	require.Eventually(t, func() bool { return ns.NumClients() == 1 }, time.Second, time.Millisecond)
}

func TestJetStreamCatalogReportsStreamCap(t *testing.T) {
	ns := startTestNATS(t, nil)
	nc, err := nats.Connect(ns.ClientURL())
	require.NoError(t, err)
	defer nc.Close()
	infos := make([]*jetstream.StreamInfo, maxJSStreams+1)
	for i := range infos {
		infos[i] = &jetstream.StreamInfo{Config: jetstream.StreamConfig{Name: "S" + strconv.Itoa(i), Subjects: []string{"s" + strconv.Itoa(i)}}}
	}
	response, err := json.Marshal(map[string]any{"total": len(infos), "limit": len(infos), "offset": 0, "streams": infos})
	require.NoError(t, err)
	_, err = nc.Subscribe("$JS.API.STREAM.LIST", func(m *nats.Msg) { _ = m.Respond(response) })
	require.NoError(t, err)
	require.NoError(t, nc.Flush())
	js, err := jetstream.New(nc)
	require.NoError(t, err)
	ctx, cancel := context.WithTimeout(context.Background(), time.Second)
	defer cancel()
	cat := enumerateJetStreamPatterns(ctx, js, true)
	require.Empty(t, cat.Error)
	require.True(t, cat.Truncated)
	require.Len(t, cat.Streams, maxJSStreams)
}

func TestOccupiedDoesNotWalkEveryPage(t *testing.T) {
	ns := startTestNATS(t, nil)
	nc, err := nats.Connect(ns.ClientURL())
	require.NoError(t, err)
	defer nc.Close()
	_, err = nc.Subscribe("$JS.API.STREAM.INFO.MANY", func(m *nats.Msg) {
		var request struct {
			Offset int `json:"offset"`
		}
		_ = json.Unmarshal(m.Data, &request)
		if request.Offset != 0 {
			return
		}
		_ = m.Respond([]byte(`{"total":100001,"limit":100000,"config":{"name":"MANY","subjects":["orders.>"]},"state":{"subjects":{"orders.created":1}}}`))
	})
	require.NoError(t, err)
	require.NoError(t, nc.Flush())
	js, err := jetstream.New(nc)
	require.NoError(t, err)
	ctx, cancel := context.WithTimeout(context.Background(), time.Second)
	defer cancel()
	cat := occupiedSubjects(ctx, js, "MANY", "orders.>", true)
	require.Empty(t, cat.Error)
	require.True(t, cat.Truncated)
	require.Len(t, cat.Subjects, 1)
}

func TestCoreWatchLeaseClosesSubscription(t *testing.T) {
	ns := startTestNATS(t, nil)
	h := newCoreWatchHub()
	defer h.close()
	require.True(t, watchSnapshot(t, h, "id", "orders.>", &connection.Connection{Hosts: []string{ns.ClientURL()}}, true, "").Watching)
	h.sweep(time.Now().Add(watchLease + time.Second))
	require.Nil(t, h.read("id", ""))
	require.Eventually(t, func() bool { return ns.NumClients() == 0 }, time.Second, time.Millisecond)
}
