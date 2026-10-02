package tests

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/dgraph-io/badger/v4"
	"github.com/nats-nui/nui/internal/connection"
	"github.com/nats-nui/nui/internal/nui"
	docstore "github.com/nats-nui/nui/pkg/storage"
	c "github.com/ostafen/clover/v2"
	badgerstore "github.com/ostafen/clover/v2/store/badger"
)

// TestStorage verifies backward compatibility when reopening on-disk data written with
// legacy Badger defaults (badger.DefaultOptions) under the tweaked options used by
// docstore.NewDocStore (smaller value-log segment and block cache; see pkg/storage/docstore.go).
//
// Each phase restarts the NUI server via startNuiServer with custom options because s.e is
// first wired to the suite's in-memory store from SetupTest, while this test must swap
// on-disk stores between phases.
func (s *NuiTestSuite) TestStorage() {
	dir := s.T().TempDir()
	want := s.storageTestConnection()
	e := s.e

	// Simulate a pre-upgrade install: persist a connection with default Badger options.
	legacy := s.openLegacyDocStore(dir)
	s.startStorageServer(legacy)
	wantBody, err := json.Marshal(want)
	s.Require().NoError(err)
	var saved connection.Connection
	e.POST("/api/connection").
		WithBytes(wantBody).
		Expect().
		Status(http.StatusOK).
		JSON().Decode(&saved)
	s.Require().NotEmpty(saved.Id)
	s.stopNuiServer()
	s.Require().NoError(legacy.Close())

	// Upgrade path: open the same directory with NewDocStore and read the legacy record.
	db := s.openDocStore(dir)
	s.startStorageServer(db)
	var got connection.Connection
	e.GET("/api/connection/" + saved.Id).
		Expect().
		Status(http.StatusOK).
		JSON().Decode(&got)
	s.stopNuiServer()
	s.Equal(saved, got)

	// Mutate through the new store to ensure read/write keeps working after migration.
	s.startStorageServer(db)
	got.Name = "updated"
	updateBody, err := json.Marshal(&got)
	s.Require().NoError(err)
	var updated connection.Connection
	e.POST("/api/connection/" + saved.Id).
		WithBytes(updateBody).
		Expect().
		Status(http.StatusOK).
		JSON().Decode(&updated)
	s.stopNuiServer()
	s.Equal(got, updated)
	s.Require().NoError(db.Close())

	// Restart with tweaked options and confirm updates survived a close/reopen cycle.
	db = s.openDocStore(dir)
	s.startStorageServer(db)
	defer s.stopNuiServer()
	e.GET("/api/connection/" + saved.Id).
		Expect().
		Status(http.StatusOK).
		JSON().Decode(&got)
	s.Equal(updated, got)
}

func (s *NuiTestSuite) startStorageServer(db *docstore.DB) {
	s.startNuiServer(
		nui.WithDocStore(db),
	)
}

func (s *NuiTestSuite) storageTestConnection() *connection.Connection {
	// Large JWT forces auth payload into Badger's value log, matching real user credentials.
	return &connection.Connection{
		Name:          "legacy",
		Hosts:         []string{s.NatsServer.Addr().String()},
		Auth:          []connection.Auth{{Mode: connection.AuthModeJwt, Jwt: strings.Repeat("a", 4096)}},
		Subscriptions: []connection.Subscription{{Subject: "orders.>"}},
		Metadata:      map[string]string{"group": "local"},
	}
}

// openLegacyDocStore opens Badger with unmodified defaults, as older nui releases did.
func (s *NuiTestSuite) openLegacyDocStore(dir string) *docstore.DB {
	store, err := badgerstore.OpenWithOptions(badger.DefaultOptions(dir))
	s.Require().NoError(err)
	legacy, err := c.OpenWithStore(store)
	s.Require().NoError(err)
	s.T().Cleanup(func() { _ = legacy.Close() })
	s.Require().NoError(legacy.CreateCollection(docstore.CONN_COLLECTION))
	return &docstore.DB{DB: legacy}
}

// openDocStore opens the same on-disk path with current production Badger tuning.
func (s *NuiTestSuite) openDocStore(dir string) *docstore.DB {
	db, err := docstore.NewDocStore(dir)
	s.Require().NoError(err)
	s.T().Cleanup(func() { _ = db.Close() })
	return db
}
