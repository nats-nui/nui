package cddlschema

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/stretchr/testify/require"
)

const personCddl = "person = { name: tstr, age: uint }\n"

// recordingLogger keeps what was logged, so a test can ask what an operator
// would have been told
type recordingLogger struct {
	lines []string
}

func (l *recordingLogger) Debug(msg string, args ...any) { l.write("debug", msg, args) }
func (l *recordingLogger) Info(msg string, args ...any)  { l.write("info", msg, args) }
func (l *recordingLogger) Warn(msg string, args ...any)  { l.write("warn", msg, args) }
func (l *recordingLogger) Error(msg string, args ...any) { l.write("error", msg, args) }

func (l *recordingLogger) write(level, msg string, args []any) {
	parts := []string{level, msg}
	for _, arg := range args {
		parts = append(parts, fmt.Sprint(arg))
	}
	l.lines = append(l.lines, strings.Join(parts, " "))
}

func (l *recordingLogger) says(fragment string) bool {
	for _, line := range l.lines {
		if strings.Contains(line, fragment) {
			return true
		}
	}
	return false
}

func setupRepo(t *testing.T) (CddlRepo, string) {
	repo, dir, _ := setupRepoWithLog(t)
	return repo, dir
}

func setupRepoWithLog(t *testing.T) (CddlRepo, string, *recordingLogger) {
	t.Helper()
	dir := t.TempDir()
	writeFile(t, filepath.Join(dir, "simple.cddl"), personCddl)
	writeFile(t, filepath.Join(dir, "simple2.cddl"), "product = { id: int }\n")
	writeFile(t, filepath.Join(dir, "notes.txt"), "not a schema")
	require.NoError(t, os.MkdirAll(filepath.Join(dir, "orders"), 0755))
	writeFile(t, filepath.Join(dir, "orders", "order.cddl"), "order = { id: int }\n")

	log := &recordingLogger{}
	repo, err := NewFileSystemCddlRepo(dir, log)
	require.NoError(t, err)
	return repo, dir, log
}

func writeFile(t *testing.T, path, content string) {
	t.Helper()
	require.NoError(t, os.WriteFile(path, []byte(content), 0644))
}

func TestFileSystemCddlRepo_All(t *testing.T) {
	repo, _ := setupRepo(t)

	all, err := repo.All()
	require.NoError(t, err)

	ids := make([]string, 0, len(all))
	for id := range all {
		ids = append(ids, id)
	}
	// files that are not .cddl are ignored, nested ones keep a slash in their id
	require.ElementsMatch(t, []string{"simple", "simple2", "orders/order"}, ids)
	require.Equal(t, personCddl, all["simple"].Content)
	require.Equal(t, "orders/order.cddl", all["orders/order"].Name)
}

func TestFileSystemCddlRepo_AllCreatesMissingDir(t *testing.T) {
	dir := filepath.Join(t.TempDir(), "cddlschemas")
	repo, err := NewFileSystemCddlRepo(dir, nil)
	require.NoError(t, err)

	all, err := repo.All()
	require.NoError(t, err)
	require.Empty(t, all)
	require.DirExists(t, dir)
}

func TestFileSystemCddlRepo_GetById(t *testing.T) {
	repo, _ := setupRepo(t)

	schema, err := repo.GetById("simple")
	require.NoError(t, err)
	require.Equal(t, "simple", schema.ID)
	require.Equal(t, "simple.cddl", schema.Name)
	require.Equal(t, personCddl, schema.Content)
}

func TestFileSystemCddlRepo_GetByIdNested(t *testing.T) {
	repo, _ := setupRepo(t)

	schema, err := repo.GetById("orders/order")
	require.NoError(t, err)
	require.Equal(t, "orders/order", schema.ID)
	require.Equal(t, "orders/order.cddl", schema.Name)
}

func TestFileSystemCddlRepo_GetByIdErrors(t *testing.T) {
	repo, dir := setupRepo(t)
	writeFile(t, filepath.Join(filepath.Dir(dir), "outside.cddl"), "secret = tstr\n")

	tests := []struct {
		name string
		id   string
	}{
		{"empty id", ""},
		{"unknown id", "nope"},
		{"not a cddl file", "notes"},
		{"escaping the schemas dir", "../outside"},
		{"escaping with slashes", "../../outside"},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			schema, err := repo.GetById(test.id)
			require.Error(t, err)
			require.Nil(t, schema)
		})
	}
}

// Which directory was read, and which files came out of it, is the first thing
// asked when a payload will not decode - and the only place it can be answered
// is the log
func TestFileSystemCddlRepo_LogsWhatItReads(t *testing.T) {
	repo, dir, log := setupRepoWithLog(t)

	require.True(t, log.says("cddl schemas will be read from disk"))
	require.True(t, log.says(dir))

	_, err := repo.All()
	require.NoError(t, err)
	require.True(t, log.says("scanned cddl schemas"))
	require.True(t, log.says("found 3"))
	require.True(t, log.says("found cddl schema id simple"))

	_, err = repo.GetById("simple")
	require.NoError(t, err)
	require.True(t, log.says("read cddl schema"))
}

func TestFileSystemCddlRepo_LogsWhatItRefuses(t *testing.T) {
	repo, _, log := setupRepoWithLog(t)

	_, err := repo.GetById("nope")
	require.Error(t, err)
	require.True(t, log.says("warn cddl schema not found id nope"))

	// reaching outside the directory is worth telling apart from a typo
	_, err = repo.GetById("../outside")
	require.Error(t, err)
	require.True(t, log.says("refused a cddl schema id pointing outside the schemas directory"))
}
