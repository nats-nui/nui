package docstore

import (
	"fmt"
	"os"
	"path/filepath"
	"sync"

	"github.com/dgraph-io/badger/v4"
	"github.com/nats-nui/nui/pkg/logging"
	c "github.com/ostafen/clover/v2"
	"github.com/ostafen/clover/v2/document"
	badgerstore "github.com/ostafen/clover/v2/store/badger"
)

const CONN_COLLECTION = "connections"

// Profile selects which Badger tuning to apply when opening on disk.
type Profile int

const (
	// ProfileLegacy matches pre-#125 behavior: badger.DefaultOptions only.
	ProfileLegacy Profile = iota
	// ProfileMinImpact is the smallest change from Legacy that still
	// shrinks the ~2GiB value-log mmap: ValueLogFileSize and BlockCacheSize
	// only. Memtables and ValueThreshold stay at DefaultOptions. Leftover
	// DefaultOptions *.vlog files are truncated by Badger's own open — no
	// extra reclaim pass.
	ProfileMinImpact
	// ProfileReclaim is the 19e6473 open path: smaller memtables, forced
	// ValueThreshold, and reclaimOversizedValueLogs before the real open.
	ProfileReclaim
)

const (
	minImpactValueLogFileSize = 32 << 20 // 64MiB apparent mmap (2 × size)
	minImpactBlockCacheSize   = 16 << 20

	reclaimValueLogFileSize = 8 << 20 // 8MiB → 16MiB on-disk mmap
	reclaimMemTableSize     = 2 << 20
	reclaimNumMemtables     = 2
	reclaimBlockCacheSize   = 8 << 20
	oversizedVlogBytes      = 32 << 20

	// DefaultOptions ValueLogFileSize is (1<<30)-1; createVlogFile maps 2× that.
	legacyMaxApparentBytes = 2 * (1<<30 - 1)
)

// EnvProfile overrides Open's default ProfileMinImpact. Test-only.
const EnvProfile = "NUI_STORAGE_PROFILE"

type DB struct {
	*c.DB
}

func NewDocStore(path string) (*DB, error) {
	return Open(path, nil)
}

// Open uses ProfileMinImpact: Legacy plus the two knobs that shrink the
// value-log mmap, without reclaim or memtable retuning. Set EnvProfile
// to override (test-only: "legacy", "min-impact", "reclaim").
func Open(path string, l logging.Slogger) (*DB, error) {
	profile, err := profileFromEnv()
	if err != nil {
		return nil, err
	}
	return open(path, profile, l)
}

func profileFromEnv() (Profile, error) {
	switch os.Getenv(EnvProfile) {
	case "", "min-impact":
		return ProfileMinImpact, nil
	case "legacy":
		return ProfileLegacy, nil
	case "reclaim":
		return ProfileReclaim, nil
	default:
		return 0, fmt.Errorf("%s: unknown profile %q", EnvProfile, os.Getenv(EnvProfile))
	}
}

// OpenWithProfile opens the store with an explicit Badger profile. Intended
// for tests and migration checks; production code should use Open.
func OpenWithProfile(path string, profile Profile, l logging.Slogger) (*DB, error) {
	return open(path, profile, l)
}

func open(path string, profile Profile, l logging.Slogger) (*DB, error) {
	if l == nil {
		l = &logging.NullLogger{}
	}
	if path == "" || path == ":memory:" {
		// Dir/ValueDir must be empty in InMemory mode. Passing ":memory:"
		// as the path (the old DefaultOptions habit) makes Badger refuse
		// to open: "Cannot use badger in Disk-less mode with Dir set".
		return openClover(badgerOptions("", profile).WithInMemory(true))
	}
	opts := badgerOptions(path, profile)
	if profile == ProfileReclaim {
		if err := reclaimOversizedValueLogs(path, opts, l); err != nil {
			return nil, err
		}
	}
	db, err := openClover(opts)
	if err != nil {
		return nil, err
	}
	// Only when a test set EnvProfile: NUI never closes the store, so the
	// suite needs this handle to reopen the same directory.
	if os.Getenv(EnvProfile) != "" {
		rememberOpen(path, db)
	}
	return db, nil
}

var (
	openMu     sync.Mutex
	openByPath = map[string]*DB{}
)

func rememberOpen(path string, db *DB) {
	openMu.Lock()
	openByPath[path] = db
	openMu.Unlock()
}

// ClosePath closes the on-disk store last opened at path. NUI does not
// close the store on HTTP shutdown; tests use this to reopen the same dir.
func ClosePath(path string) error {
	if path == "" || path == ":memory:" {
		return nil
	}
	openMu.Lock()
	db := openByPath[path]
	delete(openByPath, path)
	openMu.Unlock()
	if db == nil {
		return nil
	}
	return db.Close()
}

func badgerOptions(path string, profile Profile) badger.Options {
	opts := badger.DefaultOptions(path)
	switch profile {
	case ProfileMinImpact:
		opts = opts.
			WithValueLogFileSize(minImpactValueLogFileSize).
			WithBlockCacheSize(minImpactBlockCacheSize)
	case ProfileReclaim:
		opts = opts.
			WithValueLogFileSize(reclaimValueLogFileSize).
			WithMemTableSize(reclaimMemTableSize).
			WithNumMemtables(reclaimNumMemtables).
			WithBlockCacheSize(reclaimBlockCacheSize).
			// Default ValueThreshold is 1MiB. Badger rejects that once
			// MemTableSize is 2MiB (max batch is ~0.3 × memtable).
			WithValueThreshold(1 << 10)
	}
	return opts
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
// bytes it actually wrote. Kept as the 19e6473 path for comparison;
// ProfileMinImpact relies on the same truncate inside a single Open.
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
		// A leftover 2GiB file must not prevent NUI from starting.
		// The real open still runs; log that reclaim did not finish.
		l.Error("badger reclaim open failed", "path", path, "error", err.Error())
		return nil
	}
	if err := db.Close(); err != nil {
		l.Error("badger reclaim close failed", "path", path, "error", err.Error())
		return nil
	}
	after, err := maxApparentVlog(path)
	if err != nil {
		l.Error("badger reclaim stat failed", "path", path, "error", err.Error())
		return nil
	}
	l.Info("badger value log reclaimed", "path", path, "max_bytes", after)
	return nil
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
