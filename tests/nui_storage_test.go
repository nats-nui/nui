package tests

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"

	"github.com/dgraph-io/badger/v4"
	"github.com/nats-nui/nui/internal/connection"
	"github.com/nats-nui/nui/internal/nui"
	"github.com/nats-nui/nui/pkg/logging"
	docstore "github.com/nats-nui/nui/pkg/storage"
	c "github.com/ostafen/clover/v2"
	badgerstore "github.com/ostafen/clover/v2/store/badger"
)

func (s *NuiTestSuite) TestStorage() {
	dir := s.T().TempDir()
	store, err := badgerstore.OpenWithOptions(badger.DefaultOptions(dir))
	s.Require().NoError(err)
	legacy, err := c.OpenWithStore(store)
	s.Require().NoError(err)
	s.Require().NoError(legacy.CreateCollection(docstore.CONN_COLLECTION))

	newApp := func(db *docstore.DB) *nui.App {
		repo := connection.NewDocStoreConnRepo(db)
		pool := connection.NewConnPool(repo, func(c *connection.Connection) (*connection.NatsConn, error) {
			conn, err := connection.NatsBuilder(c)
			if err == nil {
				s.T().Cleanup(conn.Close)
			}
			return conn, err
		})
		return nui.NewServer("", &nui.Nui{ConnRepo: repo, ConnPool: pool}, &logging.NullLogger{}, false)
	}
	request := func(app *nui.App, method, path string, conn *connection.Connection) connection.Connection {
		body, err := json.Marshal(conn)
		s.Require().NoError(err)
		req := httptest.NewRequest(method, path, bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req, -1)
		s.Require().NoError(err)
		defer resp.Body.Close()
		s.Require().Equal(http.StatusOK, resp.StatusCode)
		var got connection.Connection
		s.Require().NoError(json.NewDecoder(resp.Body).Decode(&got))
		return got
	}

	want := &connection.Connection{
		Name:          "legacy",
		Hosts:         []string{s.NatsServer.Addr().String()},
		Auth:          []connection.Auth{{Mode: connection.AuthModeJwt, Jwt: strings.Repeat("a", 4096)}},
		Subscriptions: []connection.Subscription{{Subject: "orders.>"}},
		Metadata:      map[string]string{"group": "local"},
	}
	oldApp := newApp(&docstore.DB{DB: legacy})
	saved := request(oldApp, http.MethodPost, "/api/connection", want)
	s.Require().NotEmpty(saved.Id)
	s.Require().NoError(legacy.Close())

	db, err := docstore.NewDocStore(dir)
	s.Require().NoError(err)
	app := newApp(db)
	got := request(app, http.MethodGet, "/api/connection/"+saved.Id, nil)
	s.Equal(saved, got)
	got.Name = "updated"
	updated := request(app, http.MethodPost, "/api/connection/"+saved.Id, &got)
	s.Equal(got, updated)
	s.Require().NoError(db.Close())

	db, err = docstore.NewDocStore(dir)
	s.Require().NoError(err)
	defer db.Close()
	got = request(newApp(db), http.MethodGet, "/api/connection/"+saved.Id, nil)
	s.Equal(updated, got)
}
