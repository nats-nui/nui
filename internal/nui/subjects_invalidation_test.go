package nui

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"log/slog"
	"net"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"sync/atomic"
	"testing"
	"testing/synctest"
	"time"

	"github.com/nats-io/nats-server/v2/server"
	"github.com/nats-io/nats.go"
	"github.com/nats-nui/nui/internal/connection"
	"github.com/nats-nui/nui/pkg/clicontext"
	"github.com/nats-nui/nui/pkg/logging"
	"github.com/stretchr/testify/require"
)

type pausedSubjectRepo struct {
	connection.ConnRepo
	paused   atomic.Bool
	captured chan struct{}
	resume   chan struct{}
}

func (r *pausedSubjectRepo) GetById(id string) (*connection.Connection, error) {
	cfg, err := r.ConnRepo.GetById(id)
	if r.paused.CompareAndSwap(false, true) {
		close(r.captured)
		<-r.resume
	}
	return cfg, err
}

func TestCoreDiscoveryInvalidatesPendingConfig(t *testing.T) {
	for _, change := range []string{"delete", "save"} {
		t.Run(change, func(t *testing.T) {
			oldServer := startTestNATS(t, nil)
			base := connection.NewMemConnRepo()
			_, err := base.Save(&connection.Connection{Id: "id", Hosts: []string{oldServer.ClientURL()}})
			require.NoError(t, err)
			repo := &pausedSubjectRepo{ConnRepo: base, captured: make(chan struct{}), resume: make(chan struct{})}
			pool := connection.NewNatsConnPool(repo)
			app := NewServer("0", &Nui{ConnRepo: repo, ConnPool: pool}, &logging.NullLogger{}, false)
			path := "/api/connection/id/subjects/core?filter=orders.%3E&listen_ms=200"
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
			var newServer *server.Server
			var request *http.Request
			if change == "delete" {
				request = httptest.NewRequest(http.MethodDelete, "/api/connection/id", nil)
			} else {
				newServer = startTestNATS(t, nil)
				body, err := json.Marshal(connection.Connection{Hosts: []string{newServer.ClientURL()}})
				require.NoError(t, err)
				request = httptest.NewRequest(http.MethodPost, "/api/connection/id", bytes.NewReader(body))
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
			var interrupted Error
			require.NoError(t, json.NewDecoder(response.Body).Decode(&interrupted))
			require.Equal(t, "interrupted", interrupted.Error)
			oldStats, err := oldServer.Varz(nil)
			require.NoError(t, err)
			require.Zero(t, oldStats.TotalConnections, "invalidated discovery must not connect using old settings")
			require.Equal(t, http.StatusUnprocessableEntity, response.StatusCode)
			app.coreListens.mu.Lock()
			slots := len(app.coreListens.byConn)
			app.coreListens.mu.Unlock()
			require.Zero(t, slots)
			if change == "save" {
				conn, err := pool.Get("id")
				require.NoError(t, err)
				defer conn.Close()
				before, err := newServer.Varz(nil)
				require.NoError(t, err)
				response, err := app.Test(httptest.NewRequest(http.MethodGet, path, nil), -1)
				require.NoError(t, err)
				defer response.Body.Close()
				require.Equal(t, http.StatusOK, response.StatusCode)
				var catalog CoreCatalog
				require.NoError(t, json.NewDecoder(response.Body).Decode(&catalog))
				require.Empty(t, catalog.Error)
				require.Equal(t, 0, oldServer.NumClients())
				newStats, err := newServer.Varz(nil)
				require.NoError(t, err)
				require.Equal(t, before.TotalConnections+1, newStats.TotalConnections)
			}
		})
	}
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
	app := NewServer("0", &Nui{ConnRepo: repo}, &logging.NullLogger{}, false)
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
			synctest.Test(t, func(t *testing.T) {
				g := newCoreListenGate()
				first, release := g.takeover("id", t.Context())
				defer release()
				start := func() <-chan error {
					ready := make(chan error, 1)
					go func() {
						ctx, done := g.takeover("id", t.Context())
						ready <- ctx.Err()
						done()
					}()
					return ready
				}

				second := start()
				<-first.Done()
				if invalidate == "stop" {
					g.stop("id")
				}
				third := start()
				synctest.Wait()
				require.ErrorIs(t, <-second, context.Canceled)
				select {
				case <-third:
					t.Fatal("newest sample bypassed cleanup of the first sample")
				default:
				}
				release()
				require.NoError(t, <-third)
			})
		})
	}
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
			ctx, cancel := context.WithTimeout(context.Background(), 2*nats.DefaultTimeout)
			defer cancel()
			nc, err := connection.DialOnce(ctx, cfg)
			require.NoError(t, err)
			defer nc.Close()
			_, err = nc.Subscribe("orders.echo", func(m *nats.Msg) { _ = m.Respond([]byte("ok")) })
			require.NoError(t, err)
			if transport == "wss" {
				time.Sleep(nats.DefaultTimeout + 50*time.Millisecond)
			}
			msg, err := nc.RequestWithContext(ctx, "orders.echo", nil)
			require.NoError(t, err)
			require.Equal(t, "ok", string(msg.Data))
			cancel()
			require.Eventually(t, nc.IsClosed, time.Second, time.Millisecond)
			require.Eventually(t, func() bool { return ns.NumClients() == 0 }, time.Second, time.Millisecond)
		})
	}
}

func TestDiscoveryConnectionErrorsKeepPrivatePathsOutOfResponsesAndLogs(t *testing.T) {
	repo := connection.NewMemConnRepo()
	const marker = "private-fixture-ca.pem"
	cfg, err := repo.Save(&connection.Connection{
		Id: "test", Hosts: []string{"nats://127.0.0.1:1"},
		TLSAuth: connection.TLSAuth{Enabled: true, CaPath: filepath.Join(t.TempDir(), marker)},
	})
	require.NoError(t, err)
	pool := connection.NewNatsConnPool(repo)
	_, err = pool.Get(cfg.Id)
	require.ErrorContains(t, err, marker)
	var logs bytes.Buffer
	app := NewServer("0", &Nui{ConnRepo: repo, ConnPool: pool}, slog.New(slog.NewTextHandler(&logs, nil)), false)
	for _, route := range []string{"core?filter=orders", "jetstream", "jetstream/ORDERS/occupied"} {
		t.Run(route, func(t *testing.T) {
			response, err := app.Test(httptest.NewRequest(http.MethodGet, "/api/connection/"+cfg.Id+"/subjects/"+route, nil))
			require.NoError(t, err)
			defer response.Body.Close()
			body, err := io.ReadAll(response.Body)
			require.NoError(t, err)
			require.Equal(t, http.StatusUnprocessableEntity, response.StatusCode)
			require.Contains(t, string(body), "subject discovery failed")
			require.NotContains(t, string(body), marker)
			require.NotContains(t, logs.String(), marker)
		})
	}
}

func TestCoreDiscoveryStopsAtReimport(t *testing.T) {
	oldServer := startTestNATS(t, nil)
	newServer := startTestNATS(t, nil)
	repo := connection.NewMemConnRepo()
	logger := &logging.NullLogger{}
	app := NewServer("0", &Nui{ConnRepo: repo, ConnPool: connection.NewNatsConnPool(repo), CliConnImporter: clicontext.NewImporter(logger)}, logger, false)
	dir := t.TempDir()
	importURL := func(url string) string {
		config, err := json.Marshal(clicontext.CliConnectionContext{URL: url})
		require.NoError(t, err)
		require.NoError(t, os.WriteFile(filepath.Join(dir, "sample.json"), config, 0600))
		entries, err := app.ImportCliContextsFromPath(context.Background(), dir)
		require.NoError(t, err)
		require.Len(t, entries.Connections, 1)
		return entries.Connections[0].Id
	}
	id := importURL(oldServer.ClientURL())
	sampled := make(chan *http.Response, 1)
	go func() {
		response, _ := app.Test(httptest.NewRequest(http.MethodGet, "/api/connection/"+id+"/subjects/core?filter=orders.created&listen_ms=5000", nil), -1)
		sampled <- response
	}()
	require.Eventually(t, func() bool { return oldServer.GlobalAccount().SubscriptionInterest("orders.created") }, time.Second, time.Millisecond)
	require.Equal(t, id, importURL(oldServer.ClientURL()))
	select {
	case response := <-sampled:
		if response != nil {
			response.Body.Close()
		}
		t.Fatal("unchanged reimport interrupted active sample")
	case <-time.After(75 * time.Millisecond):
	}
	require.True(t, oldServer.GlobalAccount().SubscriptionInterest("orders.created"))
	require.Equal(t, id, importURL(newServer.ClientURL()))
	select {
	case response := <-sampled:
		require.NotNil(t, response)
		defer response.Body.Close()
		var catalog CoreCatalog
		require.NoError(t, json.NewDecoder(response.Body).Decode(&catalog))
		require.NotEmpty(t, catalog.Error)
		require.Zero(t, catalog.Heard)
	case <-time.After(time.Second):
		t.Fatal("sample remained active on the old server")
	}
	require.Eventually(t, func() bool { return !oldServer.GlobalAccount().SubscriptionInterest("orders.created") }, time.Second, time.Millisecond)
}

func TestPendingCoreSampleChecksImportedSettings(t *testing.T) {
	for _, same := range []bool{true, false} {
		g := newCoreListenGate()
		ctx, release := g.takeover("id", context.Background())
		cfg := &connection.Connection{Id: "id", Hosts: []string{"a"}}
		imported := *cfg
		if !same {
			imported.Hosts = []string{"b"}
		}
		g.stopIfChanged(&imported)
		g.setConfig("id", ctx, cfg)
		if same {
			require.NoError(t, ctx.Err())
		} else {
			require.ErrorIs(t, ctx.Err(), context.Canceled)
		}
		release()
	}
}
