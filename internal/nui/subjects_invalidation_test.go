package nui

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"log/slog"
	"net"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"strings"
	"sync/atomic"
	"testing"
	"time"

	"github.com/nats-io/nats-server/v2/server"
	"github.com/nats-io/nats.go"
	"github.com/nats-nui/nui/internal/connection"
	"github.com/stretchr/testify/require"
)

type pausedSubjectRepo struct {
	connection.ConnRepo
	paused   atomic.Bool
	captured chan struct{}
	resume   chan struct{}
}

// The pooled connection is unrelated to the independent SUBJECTS listener.
type subjectTestPool struct{}

func (subjectTestPool) Get(string) (*connection.NatsConn, error) { return nil, errors.New("unused") }
func (subjectTestPool) Refresh(string) error                     { return nil }
func (subjectTestPool) Purge()                                   {}

func (r *pausedSubjectRepo) GetById(id string) (*connection.Connection, error) {
	cfg, err := r.ConnRepo.GetById(id)
	if r.paused.CompareAndSwap(false, true) {
		close(r.captured)
		<-r.resume
	}
	return cfg, err
}

func TestCoreDiscoveryInvalidatesPendingConfig(t *testing.T) {
	for _, mode := range []string{"watch", "sample"} {
		for _, change := range []string{"delete", "save"} {
			t.Run(mode+"/"+change, func(t *testing.T) {
				oldServer := startTestNATS(t, nil)
				newServer := startTestNATS(t, nil)
				base := connection.NewMemConnRepo()
				_, err := base.Save(&connection.Connection{Id: "id", Hosts: []string{oldServer.ClientURL()}})
				require.NoError(t, err)
				repo := &pausedSubjectRepo{ConnRepo: base, captured: make(chan struct{}), resume: make(chan struct{})}
				app := NewServer("0", &Nui{ConnRepo: repo, ConnPool: subjectTestPool{}}, slog.New(slog.NewTextHandler(io.Discard, nil)), false)
				defer app.coreWatches.close()
				path := "/api/connection/id/subjects/core?filter=orders.%3E&session=card&listen_ms=200"
				if mode == "watch" {
					path += "&watch=true"
				}
				done := make(chan *http.Response, 1)
				go func() {
					response, _ := app.Test(httptest.NewRequest(http.MethodGet, path, nil), -1)
					done <- response
				}()
				select {
				case <-repo.captured:
				case <-time.After(time.Second):
					t.Fatal("discovery did not read config")
				}
				var request *http.Request
				if change == "delete" {
					request = httptest.NewRequest(http.MethodDelete, "/api/connection/id", nil)
				} else {
					body, err := json.Marshal(connection.Connection{Hosts: []string{newServer.ClientURL()}})
					require.NoError(t, err)
					request = httptest.NewRequest(http.MethodPost, "/api/connection/id", strings.NewReader(string(body)))
					request.Header.Set("Content-Type", "application/json")
				}
				response, err := app.Test(request, -1)
				close(repo.resume)
				require.NoError(t, err)
				require.Equal(t, http.StatusOK, response.StatusCode)
				response.Body.Close()
				select {
				case response = <-done:
				case <-time.After(time.Second):
					t.Fatal("invalidated discovery did not finish")
				}
				require.NotNil(t, response)
				defer response.Body.Close()
				var catalog CoreCatalog
				require.NoError(t, json.NewDecoder(response.Body).Decode(&catalog))
				require.False(t, catalog.Watching)
				require.Nil(t, app.coreWatches.read("id", "card"))
				oldStats, err := oldServer.Varz(nil)
				require.NoError(t, err)
				require.Zero(t, oldStats.TotalConnections, "invalidated discovery must not connect using old settings")
				if mode == "sample" {
					require.Equal(t, http.StatusUnprocessableEntity, response.StatusCode)
					app.coreListens.mu.Lock()
					slots := len(app.coreListens.byConn)
					app.coreListens.mu.Unlock()
					require.Zero(t, slots)
				}
				if change == "save" {
					response, err := app.Test(httptest.NewRequest(http.MethodGet, path, nil), -1)
					require.NoError(t, err)
					defer response.Body.Close()
					require.Equal(t, http.StatusOK, response.StatusCode)
					require.NoError(t, json.NewDecoder(response.Body).Decode(&catalog))
					require.Equal(t, mode == "watch", catalog.Watching)
					require.Equal(t, 0, oldServer.NumClients())
					newStats, err := newServer.Varz(nil)
					require.NoError(t, err)
					require.EqualValues(t, 1, newStats.TotalConnections)
				}
			})
		}
	}
}

func TestCoreWatchDetectsSilentConnectionLoss(t *testing.T) {
	ns := startTestNATS(t, nil)
	proxy, err := net.Listen("tcp", "127.0.0.1:0")
	require.NoError(t, err)
	defer proxy.Close()
	var silent atomic.Bool
	go func() {
		client, err := proxy.Accept()
		if err != nil {
			return
		}
		defer client.Close()
		upstream, err := net.Dial("tcp", ns.Addr().String())
		if err != nil {
			return
		}
		defer upstream.Close()
		forward := func(dst, src net.Conn) {
			defer dst.Close()
			buffer := make([]byte, 4096)
			for {
				n, err := src.Read(buffer)
				if err != nil {
					return
				}
				if !silent.Load() {
					if _, err := dst.Write(buffer[:n]); err != nil {
						return
					}
				}
			}
		}
		go forward(client, upstream)
		forward(upstream, client)
	}()
	h := newCoreWatchHub()
	defer h.close()
	require.True(t, watchSnapshot(t, h, "id", "orders.>", &connection.Connection{Hosts: []string{proxy.Addr().String()}}, true, "card").Watching)
	// Keep both sockets open but stop forwarding traffic, including PONGs.
	silent.Store(true)
	require.Eventually(t, func() bool {
		out := h.read("id", "card")
		return !out.Watching && out.Error != ""
	}, 10*time.Second, 10*time.Millisecond)
}

func TestCoreListenReplacesStalledDial(t *testing.T) {
	listener, err := net.Listen("tcp", "127.0.0.1:0")
	require.NoError(t, err)
	defer listener.Close()
	accepted := make(chan net.Conn, 8)
	go func() {
		for {
			conn, err := listener.Accept()
			if err != nil {
				return
			}
			accepted <- conn
		}
	}()
	repo := connection.NewMemConnRepo()
	_, err = repo.Save(&connection.Connection{Id: "id", Hosts: []string{listener.Addr().String()}})
	require.NoError(t, err)
	app := NewServer("0", &Nui{ConnRepo: repo}, slog.New(slog.NewTextHandler(io.Discard, nil)), false)
	defer app.coreWatches.close()
	start := func() <-chan struct{} {
		done := make(chan struct{})
		go func() {
			response, _ := app.Test(httptest.NewRequest(http.MethodGet, "/api/connection/id/subjects/core?filter=orders.%3E&listen_ms=200", nil), -1)
			if response != nil {
				response.Body.Close()
			}
			close(done)
		}()
		return done
	}
	var sockets []net.Conn
	defer func() {
		for _, conn := range sockets {
			conn.Close()
		}
	}()
	previous := start()
	for i := 0; i < 6; i++ {
		select {
		case conn := <-accepted:
			sockets = append(sockets, conn)
		case <-time.After(time.Second):
			t.Fatal("sample did not dial")
		}
		next := start()
		select {
		case <-previous:
		case <-time.After(500 * time.Millisecond):
			t.Fatal("replacement left the previous handshake running")
		}
		previous = next
	}
	select {
	case conn := <-accepted:
		conn.Close()
	case <-time.After(time.Second):
		t.Fatal("last sample did not dial")
	}
	select {
	case <-previous:
	case <-time.After(time.Second):
		t.Fatal("last sample did not finish")
	}
	app.coreListens.mu.Lock()
	defer app.coreListens.mu.Unlock()
	require.Empty(t, app.coreListens.byConn)
}

func TestCoreListenGateReplacementWaitsForCleanup(t *testing.T) {
	for _, invalidate := range []string{"replace", "stop"} {
		t.Run(invalidate, func(t *testing.T) {
			g := newCoreListenGate()
			first, releaseFirst := g.takeover("id", context.Background())
			defer releaseFirst()
			second := make(chan context.Context, 1)
			go func() {
				ctx, release := g.takeover("id", context.Background())
				defer release()
				second <- ctx
			}()
			<-first.Done()
			if invalidate == "stop" {
				g.stop("id")
			}
			third := make(chan context.Context, 1)
			finishThird := make(chan struct{})
			go func() {
				ctx, release := g.takeover("id", context.Background())
				defer release()
				third <- ctx
				<-finishThird
			}()
			defer close(finishThird)
			select {
			case ctx := <-second:
				require.ErrorIs(t, ctx.Err(), context.Canceled)
			case <-time.After(time.Second):
				t.Fatal("superseded waiter did not return")
			}
			select {
			case <-third:
				t.Fatal("newest sample bypassed cleanup of the first sample")
			case <-time.After(50 * time.Millisecond):
			}
			releaseFirst()
			select {
			case ctx := <-third:
				require.NoError(t, ctx.Err())
			case <-time.After(time.Second):
				t.Fatal("newest sample did not acquire the released slot")
			}
		})
	}
}

func TestCoreWatchMissingConnectionsLeaveNoSlots(t *testing.T) {
	app := NewServer("0", &Nui{ConnRepo: connection.NewMemConnRepo()}, slog.New(slog.NewTextHandler(io.Discard, nil)), false)
	defer app.coreWatches.close()
	for i := 0; i < 20; i++ {
		response, err := app.Test(httptest.NewRequest(http.MethodGet, "/api/connection/missing/subjects/core?watch=true&filter=orders.%3E", nil), -1)
		require.NoError(t, err)
		require.Equal(t, http.StatusNotFound, response.StatusCode)
		response.Body.Close()
	}
	app.coreWatches.mu.Lock()
	defer app.coreWatches.mu.Unlock()
	require.Empty(t, app.coreWatches.byConn)
}

func TestSubjectDialPreservesTLSAuthAndInbox(t *testing.T) {
	for _, transport := range []string{"tls", "tls-first", "ws", "wss"} {
		t.Run(transport, func(t *testing.T) {
			first := transport == "tls-first"
			websocket := strings.HasPrefix(transport, "ws")
			secure := transport != "ws"
			cert := func(name string) string { return filepath.Join("..", "..", "tests", "certs_insecure", name) }
			tlsConfig, err := server.GenTLSConfig(&server.TLSConfigOpts{
				CertFile: cert("tests-server-cert.pem"), KeyFile: cert("tests-server-key.pem"),
				CaFile: cert("tests-ca.pem"), Verify: true,
			})
			require.NoError(t, err)
			opts := &server.Options{
				Host: "127.0.0.1", Port: -1, NoLog: true, NoSigs: true,
				TLSConfig: tlsConfig, TLSVerify: true, TLSHandshakeFirst: first,
				Users: []*server.User{{Username: "limited", Password: "test", Permissions: &server.Permissions{
					Subscribe: &server.SubjectPermission{Allow: []string{"orders.>", "private.inbox.>"}},
				}}},
			}
			if websocket {
				opts.TLSConfig, opts.TLSVerify = nil, false
				opts.Websocket = server.WebsocketOpts{Host: "127.0.0.1", Port: -1, NoTLS: !secure}
				if secure {
					opts.Websocket.TLSConfig = tlsConfig
				}
			}
			ns := startTestNATS(t, opts)
			cfg := &connection.Connection{
				Hosts: []string{ns.ClientURL()}, InboxPrefix: "private.inbox",
				Auth: []connection.Auth{{Active: true, Mode: connection.AuthModeUserPassword, Username: "limited", Password: "test"}},
				TLSAuth: connection.TLSAuth{
					Enabled: secure, HandshakeFirst: first, CaPath: cert("tests-ca.pem"),
					CertPath: cert("tests-client-cert.pem"), KeyPath: cert("tests-client-key.pem"),
				},
			}
			if websocket {
				cfg.Hosts = []string{ns.WebsocketURL()}
			}
			ctx, cancel := context.WithTimeout(context.Background(), time.Second)
			defer cancel()
			nc, err := connection.DialOnce(ctx, cfg)
			require.NoError(t, err)
			defer nc.Close()
			_, err = nc.Subscribe("orders.echo", func(m *nats.Msg) { _ = m.Respond([]byte("ok")) })
			require.NoError(t, err)
			msg, err := nc.RequestWithContext(ctx, "orders.echo", nil)
			require.NoError(t, err)
			require.Equal(t, "ok", string(msg.Data))
			cancel()
			require.Eventually(t, nc.IsClosed, time.Second, time.Millisecond)
			require.Eventually(t, func() bool { return ns.NumClients() == 0 }, time.Second, time.Millisecond)
		})
	}
}
