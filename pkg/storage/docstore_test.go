package docstore

import (
	"os"
	"path/filepath"
	"strings"
	"sync"
	"testing"

	"github.com/ostafen/clover/v2/document"
	"github.com/stretchr/testify/require"
)

type memLogger struct {
	mu   sync.Mutex
	info []string
	warn []string
	err  []string
}

func (m *memLogger) Debug(string, ...any) {}
func (m *memLogger) Info(msg string, _ ...any) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.info = append(m.info, msg)
}
func (m *memLogger) Warn(msg string, _ ...any) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.warn = append(m.warn, msg)
}
func (m *memLogger) Error(msg string, _ ...any) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.err = append(m.err, msg)
}

func (m *memLogger) has(level, substr string) bool {
	m.mu.Lock()
	defer m.mu.Unlock()
	var rows []string
	switch level {
	case "info":
		rows = m.info
	case "warn":
		rows = m.warn
	case "error":
		rows = m.err
	}
	for _, row := range rows {
		if strings.Contains(row, substr) {
			return true
		}
	}
	return false
}

func TestDocStore_InMemoryOpens(t *testing.T) {
	db, err := NewDocStore(":memory:")
	require.NoError(t, err)
	t.Cleanup(func() { _ = db.Close() })

	doc := document.NewDocument()
	doc.Set("name", "mem")
	id, err := db.InsertOne(CONN_COLLECTION, doc)
	require.NoError(t, err)
	got, err := db.FindById(CONN_COLLECTION, id)
	require.NoError(t, err)
	require.Equal(t, "mem", got.Get("name"))
}

func TestDocStore_OnDiskFootprintStaysSmallWhileOpen(t *testing.T) {
	dir := t.TempDir()
	db, err := NewDocStore(dir)
	require.NoError(t, err)
	t.Cleanup(func() { _ = db.Close() })

	doc := document.NewDocument()
	doc.Set("name", "local-flood")
	doc.Set("hosts", []string{"127.0.0.1:4222"})
	_, err = db.InsertOne(CONN_COLLECTION, doc)
	require.NoError(t, err)

	max := maxApparentFile(t, dir)
	require.Less(t, max, int64(oversizedVlogBytes),
		"open db must not mmap a DefaultOptions-sized value log")
}

func TestDocStore_ReclaimsLeftoverValueLog(t *testing.T) {
	dir := t.TempDir()
	db, err := NewDocStore(dir)
	require.NoError(t, err)
	doc := document.NewDocument()
	doc.Set("name", "keep-me")
	id, err := db.InsertOne(CONN_COLLECTION, doc)
	require.NoError(t, err)
	require.NoError(t, db.Close())

	vlogs, err := filepath.Glob(filepath.Join(dir, "*.vlog"))
	require.NoError(t, err)
	require.NotEmpty(t, vlogs)
	require.NoError(t, os.Truncate(vlogs[0], 40<<20))

	oversized, err := hasOversizedValueLog(dir)
	require.NoError(t, err)
	require.True(t, oversized)

	log := &memLogger{}
	db, err = Open(dir, log)
	require.NoError(t, err)
	t.Cleanup(func() { _ = db.Close() })

	got, err := db.FindById(CONN_COLLECTION, id)
	require.NoError(t, err)
	require.NotNil(t, got)
	require.Equal(t, "keep-me", got.Get("name"))
	require.Less(t, maxApparentFile(t, dir), int64(oversizedVlogBytes))
	require.True(t, log.has("warn", "leftover value log exceeds limit"), "reclaim must be logged")
	require.True(t, log.has("info", "value log reclaimed"))
	require.True(t, log.has("info", "opened with nui limits"))
}

func maxApparentFile(t *testing.T, dir string) int64 {
	t.Helper()
	var max int64
	err := filepath.Walk(dir, func(path string, info os.FileInfo, err error) error {
		if err != nil || info.IsDir() {
			return err
		}
		if info.Size() > max {
			max = info.Size()
		}
		return nil
	})
	require.NoError(t, err)
	return max
}
