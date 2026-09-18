package docstore

import (
	"os"
	"path/filepath"

	"github.com/dgraph-io/badger/v4"
	"github.com/nats-nui/nui/pkg/logging"
	c "github.com/ostafen/clover/v2"
	"github.com/ostafen/clover/v2/document"
	badgerstore "github.com/ostafen/clover/v2/store/badger"
)

const CONN_COLLECTION = "connections"

// Badger DefaultOptions is sized for a large KV store. createVlogFile
// truncates each *.vlog to 2*ValueLogFileSize, so the defaults
// (ValueLogFileSize=1GiB-1) produce a ~2GiB file the moment the DB
// opens — nats-nui/nui#125. NUI only stores a handful of connection
// documents, so we shrink the mmap, memtables, and block cache.
// These limits are always on; there is no opt-in flag.
const (
	valueLogFileSize   = 8 << 20 // 8MiB → 16MiB on-disk mmap
	memTableSize       = 2 << 20
	blockCacheSize     = 8 << 20
	oversizedVlogBytes = 32 << 20
)

type DB struct {
	*c.DB
}

func NewDocStore(path string) (*DB, error) {
	return Open(path, nil)
}

func Open(path string, l logging.Slogger) (*DB, error) {
	if l == nil {
		l = &logging.NullLogger{}
	}
	if path == "" || path == ":memory:" {
		// Dir/ValueDir must be empty in InMemory mode. Passing ":memory:"
		// as the path (the old DefaultOptions habit) makes Badger refuse
		// to open: "Cannot use badger in Disk-less mode with Dir set".
		l.Info("badger opened in memory")
		return openClover(nuiBadgerOptions("").WithInMemory(true))
	}
	opts := nuiBadgerOptions(path)
	if err := reclaimOversizedValueLogs(path, opts, l); err != nil {
		return nil, err
	}
	db, err := openClover(opts)
	if err != nil {
		return nil, err
	}
	l.Info("badger opened with nui limits",
		"path", path,
		"value_log_file_size", valueLogFileSize,
		"value_log_mmap_bytes", valueLogFileSize*2,
		"memtable_size", memTableSize,
		"block_cache_size", blockCacheSize,
	)
	return db, nil
}

func nuiBadgerOptions(path string) badger.Options {
	return badger.DefaultOptions(path).
		WithValueLogFileSize(valueLogFileSize).
		WithMemTableSize(memTableSize).
		WithNumMemtables(2).
		WithNumLevelZeroTables(2).
		WithNumLevelZeroTablesStall(4).
		WithNumCompactors(2).
		WithBlockCacheSize(blockCacheSize).
		WithIndexCacheSize(0).
		WithValueThreshold(1 << 10).
		WithNumVersionsToKeep(1).
		WithDetectConflicts(false).
		WithCompactL0OnClose(true).
		WithMetricsEnabled(false).
		WithLoggingLevel(badger.WARNING).
		WithNumGoroutines(2)
}

func openClover(opts badger.Options) (*DB, error) {
	store, err := badgerstore.OpenWithOptions(opts)
	if err != nil {
		return nil, err
	}
	db, err := c.OpenWithStore(store)
	if err != nil {
		_ = store.Close()
		return nil, err
	}
	if err = createCollection(db, CONN_COLLECTION); err != nil {
		_ = db.Close()
		return nil, err
	}
	return &DB{DB: db}, nil
}

type vlogFile struct {
	name string
	size int64
}

// reclaimOversizedValueLogs opens and closes a leftover DefaultOptions
// value log (typical after a crash) so Badger can truncate it to the
// bytes it actually wrote. A clean shutdown already does this; a
// running process with the old defaults is what `ls` reports as 2GiB.
func reclaimOversizedValueLogs(path string, opts badger.Options, l logging.Slogger) error {
	files, err := listOversizedValueLogs(path)
	if err != nil || len(files) == 0 {
		return err
	}
	for _, f := range files {
		l.Warn("badger leftover value log exceeds limit; reclaiming",
			"path", path,
			"file", f.name,
			"bytes", f.size,
			"limit_bytes", oversizedVlogBytes,
		)
	}
	db, err := badger.Open(opts)
	if err != nil {
		l.Error("badger reclaim open failed", "path", path, "error", err.Error())
		return err
	}
	if err := db.Close(); err != nil {
		l.Error("badger reclaim close failed", "path", path, "error", err.Error())
		return err
	}
	after, err := maxApparentVlog(path)
	if err != nil {
		return err
	}
	l.Info("badger value log reclaimed", "path", path, "max_bytes", after)
	return nil
}

func hasOversizedValueLog(path string) (bool, error) {
	files, err := listOversizedValueLogs(path)
	if err != nil {
		return false, err
	}
	return len(files) > 0, nil
}

func listOversizedValueLogs(path string) ([]vlogFile, error) {
	matches, err := filepath.Glob(filepath.Join(path, "*.vlog"))
	if err != nil {
		return nil, err
	}
	var out []vlogFile
	for _, name := range matches {
		info, err := os.Stat(name)
		if err != nil {
			return nil, err
		}
		if info.Size() > oversizedVlogBytes {
			out = append(out, vlogFile{name: name, size: info.Size()})
		}
	}
	return out, nil
}

func maxApparentVlog(path string) (int64, error) {
	matches, err := filepath.Glob(filepath.Join(path, "*.vlog"))
	if err != nil {
		return 0, err
	}
	var max int64
	for _, name := range matches {
		info, err := os.Stat(name)
		if err != nil {
			return 0, err
		}
		if info.Size() > max {
			max = info.Size()
		}
	}
	return max, nil
}

func (d *DB) DocFromType(obj any) *document.Document {
	return document.NewDocumentOf(obj)
}

func createCollection(db *c.DB, name string) error {
	ok, err := db.HasCollection(name)
	if err != nil {
		return err
	}
	if ok {
		return nil
	}
	return db.CreateCollection(name)
}
