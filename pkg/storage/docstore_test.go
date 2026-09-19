package docstore

import (
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/dgraph-io/badger/v4"
	c "github.com/ostafen/clover/v2"
	"github.com/ostafen/clover/v2/document"
	badgerstore "github.com/ostafen/clover/v2/store/badger"
	"github.com/stretchr/testify/require"
)

func TestDocStore_InMemoryLargeJWT(t *testing.T) {
	for _, path := range []string{"", ":memory:"} {
		t.Run(path, func(t *testing.T) {
			db, err := NewDocStore(path)
			require.NoError(t, err)
			t.Cleanup(func() { require.NoError(t, db.Close()) })
			jwt := strings.Repeat("a", 4096)
			doc := document.NewDocument()
			doc.Set("jwt", jwt)
			id, err := db.InsertOne(CONN_COLLECTION, doc)
			require.NoError(t, err)
			got, err := db.FindById(CONN_COLLECTION, id)
			require.NoError(t, err)
			require.NotNil(t, got)
			require.Equal(t, jwt, got.Get("jwt"))
		})
	}
}

func TestDocStore_ValueLogSizeWhileOpen(t *testing.T) {
	dir := t.TempDir()
	db, err := NewDocStore(dir)
	require.NoError(t, err)
	t.Cleanup(func() { require.NoError(t, db.Close()) })
	require.Equal(t, int64(64<<20), maxApparentVlogSize(t, dir))
}

func TestDocStore_ReopensLegacyValueLog(t *testing.T) {
	dir := t.TempDir()
	store, err := badgerstore.OpenWithOptions(badger.DefaultOptions(dir))
	require.NoError(t, err)
	legacy, err := c.OpenWithStore(store)
	require.NoError(t, err)
	require.NoError(t, legacy.CreateCollection(CONN_COLLECTION))
	doc := document.NewDocument()
	doc.Set("name", "keep-me")
	// Exceed the default value threshold so the data lives in the value log.
	payload := strings.Repeat("a", 2<<20)
	doc.Set("payload", payload)
	id, err := legacy.InsertOne(CONN_COLLECTION, doc)
	require.NoError(t, err)
	require.NoError(t, legacy.Close())

	vlogs, err := filepath.Glob(filepath.Join(dir, "*.vlog"))
	require.NoError(t, err)
	require.NotEmpty(t, vlogs)
	// Restore unused trailing space left by an unclean shutdown.
	for _, name := range vlogs {
		require.NoError(t, os.Truncate(name, 2*(1<<30-1)))
	}
	require.Equal(t, int64(2*(1<<30-1)), maxApparentVlogSize(t, dir))

	db, err := NewDocStore(dir)
	require.NoError(t, err)
	t.Cleanup(func() { require.NoError(t, db.Close()) })
	got, err := db.FindById(CONN_COLLECTION, id)
	require.NoError(t, err)
	require.NotNil(t, got)
	require.Equal(t, "keep-me", got.Get("name"))
	require.Equal(t, payload, got.Get("payload"))
	require.LessOrEqual(t, maxApparentVlogSize(t, dir), int64(64<<20))
}

func maxApparentVlogSize(t *testing.T, dir string) int64 {
	t.Helper()
	names, err := filepath.Glob(filepath.Join(dir, "*.vlog"))
	require.NoError(t, err)
	require.NotEmpty(t, names)
	var max int64
	for _, name := range names {
		info, err := os.Stat(name)
		require.NoError(t, err)
		if info.Size() > max {
			max = info.Size()
		}
	}
	return max
}
