package nui

import (
	"fmt"
	"github.com/nats-io/nats-server/v2/server"
	"github.com/nats-nui/nui/internal/connection"
	"github.com/nats-nui/nui/pkg/clicontext"
	"github.com/nats-nui/nui/pkg/logging"
	"github.com/stretchr/testify/require"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"
)

func TestSaveConnectionAllowsSubscriptionUpdateDuringDial(t *testing.T) {
	repo := connection.NewMemConnRepo()
	other, err := repo.Save(&connection.Connection{Name: "other"})
	require.NoError(t, err)
	dialing, resume := make(chan struct{}), make(chan struct{})
	pool := connection.NewConnPool(repo, func(*connection.Connection) (*connection.NatsConn, error) {
		close(dialing)
		<-resume
		return &connection.NatsConn{}, nil
	})
	app := NewServer("0", &Nui{ConnRepo: repo, ConnPool: pool}, &logging.NullLogger{}, false)
	post := func(path, body string, timeout int) error {
		req := httptest.NewRequest(http.MethodPost, path, strings.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req, timeout)
		if err != nil {
			return err
		}
		defer resp.Body.Close()
		if resp.StatusCode != http.StatusOK {
			return fmt.Errorf("POST %s returned %s", path, resp.Status)
		}
		return nil
	}
	saved := make(chan error, 1)
	go func() {
		saved <- post("/api/connection", `{"name":"slow"}`, -1)
	}()
	defer func() {
		close(resume)
		require.NoError(t, <-saved)
	}()
	select {
	case <-dialing:
	case <-time.After(time.Second):
		t.Fatal("save did not start dialing")
	}
	require.NoError(t, post("/api/connection/"+other.Id+"/messages/subscription", `[{"subject":"orders"}]`, 1000))
	updated, err := repo.GetById(other.Id)
	require.NoError(t, err)
	require.Equal(t, []connection.Subscription{{Subject: "orders"}}, updated.Subscriptions)
}

func startImportTestServer(t *testing.T) *server.Server {
	t.Helper()
	s, err := server.NewServer(&server.Options{Host: "127.0.0.1", Port: -1, NoSigs: true})
	require.NoError(t, err)
	go s.Start()
	t.Cleanup(s.Shutdown)
	require.True(t, s.ReadyForConnections(time.Second))
	return s
}

type brokerImporter struct{}

func (brokerImporter) Import(url string) ([]clicontext.ImportedContextEntry, error) {
	return []clicontext.ImportedContextEntry{{Name: "orders", Path: "orders.json", ImportedContext: clicontext.CliConnectionContext{URL: url}}}, nil
}

type pausedSnapshots struct {
	connection.ConnRepo
	read chan chan struct{}
}

func (r pausedSnapshots) All() (map[string]*connection.Connection, error) {
	snapshot, err := r.ConnRepo.All()
	resume := make(chan struct{})
	r.read <- resume
	<-resume
	return snapshot, err
}

func TestOverlappingImportsUseWinningSettings(t *testing.T) {
	first, second := startImportTestServer(t), startImportTestServer(t)
	repo := connection.NewMemConnRepo()
	dials := 0
	pool := connection.NewConnPool(repo, func(cfg *connection.Connection) (*connection.NatsConn, error) {
		dials++
		return connection.NatsBuilder(cfg)
	})
	app := NewServer("0", &Nui{ConnRepo: repo, ConnPool: pool, CliConnImporter: brokerImporter{}}, &logging.NullLogger{}, false)
	initial, err := app.ImportCliContextsFromPath(t.Context(), first.ClientURL())
	require.NoError(t, err)
	id := initial.Connections[0].Id
	require.Zero(t, dials)
	connectedTo := func(want *server.Server) *connection.NatsConn {
		t.Helper()
		conn, err := pool.Get(id)
		require.NoError(t, err)
		t.Cleanup(conn.Close)
		require.Equal(t, want.ID(), conn.ConnectedServerId())
		return conn
	}
	original := connectedTo(first)
	unchanged, err := app.ImportCliContextsFromPath(t.Context(), first.ClientURL())
	require.NoError(t, err)
	require.Equal(t, id, unchanged.Connections[0].Id)
	cached, err := pool.Get(id)
	require.NoError(t, err)
	require.Same(t, original, cached)

	paused := pausedSnapshots{repo, make(chan chan struct{}, 2)}
	app.nui.ConnRepo = paused
	start := func(url string) <-chan error {
		done := make(chan error, 1)
		go func() {
			response, err := app.ImportCliContextsFromPath(t.Context(), url)
			if err == nil && (len(response.Connections) != 1 || response.Connections[0].Id != id) {
				err = fmt.Errorf("reimport of %s did not return profile %s", url, id)
			}
			done <- err
		}()
		return done
	}
	change := start(second.ClientURL())
	firstRead := <-paused.read
	restore := start(first.ClientURL())
	// A concurrent restore may parse its input, but must snapshot after the change saves.
	select {
	case early := <-paused.read:
		close(early)
		close(firstRead)
		t.Fatal("second import captured the old snapshot")
	case <-time.After(30 * time.Millisecond):
	}
	close(firstRead)
	require.NoError(t, <-change)
	restoreRead := <-paused.read
	require.Equal(t, 1, dials)
	require.True(t, original.IsClosed())
	connectedTo(second)
	close(restoreRead)
	require.NoError(t, <-restore)
	connectedTo(first)
}
