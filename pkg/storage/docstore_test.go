package docstore

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/ostafen/clover/v2/document"
	"github.com/stretchr/testify/require"
)

func allProfiles() []Profile {
	return []Profile{ProfileLegacy, ProfileMinImpact, ProfileReclaim}
}

func (p Profile) String() string {
	switch p {
	case ProfileLegacy:
		return "legacy"
	case ProfileMinImpact:
		return "min-impact"
	case ProfileReclaim:
		return "reclaim"
	default:
		return "unknown"
	}
}

func (p Profile) expectedVlogMmapBytes() int64 {
	switch p {
	case ProfileMinImpact:
		return 2 * minImpactValueLogFileSize
	case ProfileReclaim:
		return 2 * reclaimValueLogFileSize
	default:
		return legacyMaxApparentBytes
	}
}

// leftoverOversizedBytes is just over oversizedVlogBytes (32MiB) so
// reclaimOversizedValueLogs treats the file as leftover.
const leftoverOversizedBytes = 40 << 20

// TestProfiles_LeftoverValueLog: create with legacy, reopen with reclaim
// (no error, vlog shrunk), then the same with min-impact.
func TestProfiles_LeftoverValueLog(t *testing.T) {
	for _, profile := range []Profile{ProfileReclaim, ProfileMinImpact} {
		t.Run(profile.String(), func(t *testing.T) {
			dir, id := leftoverOversizedDB(t)

			db, err := OpenWithProfile(dir, profile, nil)
			require.NoError(t, err)
			t.Cleanup(func() { _ = db.Close() })

			got, err := db.FindById(CONN_COLLECTION, id)
			require.NoError(t, err)
			require.Equal(t, "keep-me", got.Get("name"))

			gotSize := maxApparentVlogSize(t, dir)
			require.Less(t, gotSize, int64(legacyMaxApparentBytes),
				"%s must shrink the leftover DefaultOptions value log", profile)
		})
	}
}

// TestProfiles_NewDBValueLogWhileOpen: a fresh open uses this profile's
// mmap size the whole time the DB is open. Reclaim is irrelevant here.
func TestProfiles_NewDBValueLogWhileOpen(t *testing.T) {
	for _, profile := range allProfiles() {
		t.Run(profile.String(), func(t *testing.T) {
			dir := t.TempDir()
			db, err := OpenWithProfile(dir, profile, nil)
			require.NoError(t, err)
			t.Cleanup(func() { _ = db.Close() })

			doc := document.NewDocument()
			doc.Set("name", "local-flood")
			_, err = db.InsertOne(CONN_COLLECTION, doc)
			require.NoError(t, err)

			require.Equal(t, profile.expectedVlogMmapBytes(), maxApparentVlogSize(t, dir),
				"open db should mmap a value log of this profile's size")
		})
	}
}

// leftoverOversizedDB builds a real Badger store, then fakes a leftover
// value log. Close() is required: Badger holds an exclusive directory lock,
// so the leftover reopen cannot run in this process until the first handle
// is released. Close also truncates *.vlog to the few bytes actually
// written, which is below oversizedVlogBytes, so reclaim would not run.
// Growing the file to leftoverOversizedBytes after Close is the fixture
// for "ls shows a huge leftover, data must survive" without a second
// process and a kill.
func leftoverOversizedDB(t *testing.T) (dir, id string) {
	t.Helper()
	dir = t.TempDir()

	legacy, err := OpenWithProfile(dir, ProfileLegacy, nil)
	require.NoError(t, err)
	doc := document.NewDocument()
	doc.Set("name", "keep-me")
	id, err = legacy.InsertOne(CONN_COLLECTION, doc)
	require.NoError(t, err)
	require.NoError(t, legacy.Close())

	vlogs, err := filepath.Glob(filepath.Join(dir, "*.vlog"))
	require.NoError(t, err)
	require.NotEmpty(t, vlogs)
	for _, name := range vlogs {
		require.NoError(t, os.Truncate(name, leftoverOversizedBytes))
	}

	max, err := maxApparentVlog(dir)
	require.NoError(t, err)
	require.Greater(t, max, int64(oversizedVlogBytes))
	return dir, id
}

func maxApparentVlogSize(t *testing.T, dir string) int64 {
	t.Helper()
	max, err := maxApparentVlog(dir)
	require.NoError(t, err)
	return max
}
