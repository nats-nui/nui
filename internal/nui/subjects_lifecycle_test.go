package nui

import (
	"context"
	"encoding/json"
	"io"
	"net"
	"net/http/httptest"
	"strconv"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/nats-io/nats-server/v2/server"
	"github.com/nats-io/nats.go"
	"github.com/nats-io/nats.go/jetstream"
	"github.com/nats-nui/nui/internal/connection"
	"github.com/nats-nui/nui/internal/ws"
	"github.com/nats-nui/nui/pkg/logging"
	"github.com/stretchr/testify/require"
)

func TestCoreWatchConcurrentStart(t *testing.T) {
	ns := startTestNATS(t, nil)
	cfg := &connection.Connection{Hosts: []string{ns.ClientURL()}}
	h := newCoreWatchHub()
	defer h.close()
	var wg sync.WaitGroup
	for i := 0; i < 20; i++ {
		wg.Add(1)
		go func() { defer wg.Done(); h.snapshot("id", "orders.>", cfg, true, "card") }()
	}
	wg.Wait()
	require.Equal(t, 1, ns.NumClients())
	h.stop("id")
	require.Eventually(t, func() bool { return ns.NumClients() == 0 }, time.Second, time.Millisecond)
}

func TestCoreWatchStopDuringDial(t *testing.T) {
	ns := startTestNATS(t, nil)
	proxy, err := net.Listen("tcp", "127.0.0.1:0")
	require.NoError(t, err)
	defer proxy.Close()
	accepted := make(chan struct{})
	resume := make(chan struct{})
	go func() {
		client, err := proxy.Accept()
		if err != nil {
			return
		}
		defer client.Close()
		close(accepted)
		<-resume
		upstream, err := net.Dial("tcp", ns.Addr().String())
		if err != nil {
			return
		}
		defer upstream.Close()
		go func() { io.Copy(upstream, client); upstream.Close() }()
		io.Copy(client, upstream)
	}()
	h := newCoreWatchHub()
	defer h.close()
	done := make(chan *CoreCatalog, 1)
	go func() {
		done <- h.snapshot("id", "orders.>", &connection.Connection{Hosts: []string{proxy.Addr().String()}}, true, "card")
	}()
	select {
	case <-accepted:
	case <-time.After(time.Second):
		t.Fatal("dial did not start")
	}
	h.stopSession("id", "card")
	close(resume)
	select {
	case out := <-done:
		require.False(t, out.Watching)
	case <-time.After(3 * time.Second):
		t.Fatal("stopped dial did not finish")
	}
	require.Nil(t, h.read("id", "card"))
	require.Eventually(t, func() bool { return ns.NumClients() == 0 }, time.Second, time.Millisecond)
}

func TestCoreWatchOwnership(t *testing.T) {
	ns := startTestNATS(t, nil)
	cfg := &connection.Connection{Hosts: []string{ns.ClientURL()}}
	h := newCoreWatchHub()
	defer h.close()
	require.True(t, h.snapshot("id", "orders.>", cfg, true, "first").Watching)
	require.True(t, h.snapshot("id", "other.>", cfg, true, "second").Watching)
	h.stopSession("id", "first")
	require.Nil(t, h.read("id", "first"))
	require.True(t, h.read("id", "second").Watching)
	h.close()
	require.False(t, h.snapshot("id", ">", cfg, true, "second").Watching)
	require.Eventually(t, func() bool { return ns.NumClients() == 0 }, time.Second, time.Millisecond)
}

func TestCoreWatchPermissionAndDisconnect(t *testing.T) {
	ns := startTestNATS(t, &server.Options{Host: "127.0.0.1", Port: -1, NoLog: true, NoSigs: true,
		Users: []*server.User{{Username: "limited", Password: "test", Permissions: &server.Permissions{Subscribe: &server.SubjectPermission{Allow: []string{"orders.>"}}}}},
	})
	cfg := &connection.Connection{Hosts: []string{ns.ClientURL()}, Auth: []connection.Auth{{Active: true, Mode: connection.AuthModeUserPassword, Username: "limited", Password: "test"}}}
	h := newCoreWatchHub()
	defer h.close()
	h.snapshot("id", "secret.>", cfg, true, "")
	require.Eventually(t, func() bool { out := h.read("id", ""); return out.Error == "not allowed" && !out.Watching }, time.Second, time.Millisecond)
	require.True(t, h.snapshot("id", "orders.>", cfg, true, "").Watching)
	ns.Shutdown()
	require.Eventually(t, func() bool { out := h.read("id", ""); return out.Error != "" && !out.Watching }, time.Second, time.Millisecond)
}

func TestCoreWatchStopsAtNameCap(t *testing.T) {
	ns := startTestNATS(t, nil)
	h := newCoreWatchHub()
	defer h.close()
	cfg := &connection.Connection{Hosts: []string{ns.ClientURL()}}
	require.True(t, h.snapshot("id", "cap.>", cfg, true, "").Watching)
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

func TestSubjectLastPreservesPayloadAndHeaders(t *testing.T) {
	ns := startTestNATS(t, jsOpts(t))
	nc, err := nats.Connect(ns.ClientURL())
	require.NoError(t, err)
	defer nc.Close()
	js, err := jetstream.New(nc)
	require.NoError(t, err)
	_, err = js.CreateStream(context.Background(), jetstream.StreamConfig{Name: "ORDERS", Subjects: []string{"orders.>"}, Storage: jetstream.MemoryStorage})
	require.NoError(t, err)
	payload := []byte(strings.Repeat("\u00e9", 8192))
	header := nats.Header{"x_request_id": {"test"}}
	_, err = js.PublishMsg(context.Background(), &nats.Msg{Subject: "orders.created", Data: payload, Header: header})
	require.NoError(t, err)
	repo := connection.NewMemConnRepo()
	cfg, err := repo.Save(&connection.Connection{Hosts: []string{ns.ClientURL()}})
	require.NoError(t, err)
	pool := connection.NewConnPool(repo, func(_ *connection.Connection) (*connection.NatsConn, error) {
		return &connection.NatsConn{Conn: nc}, nil
	})
	app := NewServer("", &Nui{ConnRepo: repo, ConnPool: pool}, &logging.NullLogger{}, false)
	response, err := app.Test(httptest.NewRequest("GET", "/api/connection/"+cfg.Id+"/subjects/last?stream=ORDERS&subject=orders.created", nil))
	require.NoError(t, err)
	defer response.Body.Close()
	require.Equal(t, 200, response.StatusCode)
	var got ws.NatsMsg
	require.NoError(t, json.NewDecoder(response.Body).Decode(&got))
	require.Equal(t, payload, got.Payload)
	require.Equal(t, map[string][]string(header), got.Headers)
	response, err = app.Test(httptest.NewRequest("GET", "/api/connection/"+cfg.Id+"/subjects/last?stream=ORDERS&subject=orders.*", nil))
	require.NoError(t, err)
	defer response.Body.Close()
	require.Equal(t, 422, response.StatusCode)
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
	require.True(t, h.snapshot("id", "orders.>", &connection.Connection{Hosts: []string{ns.ClientURL()}}, true, "").Watching)
	h.sweep(time.Now().Add(watchLease + time.Second))
	require.Nil(t, h.read("id", ""))
	require.Eventually(t, func() bool { return ns.NumClients() == 0 }, time.Second, time.Millisecond)
}
