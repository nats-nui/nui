package cddlschema

import (
	"errors"
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"strings"

	"github.com/nats-nui/nui/pkg/logging"
)

// FileSystemCddlRepo implements CddlRepo using filesystem storage
type FileSystemCddlRepo struct {
	baseDir string
	l       logging.Slogger
}

// NewFileSystemCddlRepo creates a new filesystem-based CDDL schema repository.
// Where the schemas come from is the first thing to check when a payload will
// not decode, so the directory is reported as soon as it is known.
func NewFileSystemCddlRepo(baseDir string, l logging.Slogger) (CddlRepo, error) {
	if l == nil {
		l = &logging.NullLogger{}
	}
	l.Info("cddl schemas will be read from disk", "dir", baseDir)
	return &FileSystemCddlRepo{baseDir: baseDir, l: l}, nil
}

// All returns all CDDL schemas from the filesystem
func (r *FileSystemCddlRepo) All() (map[string]*CddlSchema, error) {
	return r.AllInPath(r.baseDir)
}

func (r *FileSystemCddlRepo) AllInPath(dir string) (map[string]*CddlSchema, error) {
	if err := os.MkdirAll(dir, 0755); err != nil {
		r.l.Error("cannot use the cddl schemas directory", "dir", dir, "error", err)
		return nil, fmt.Errorf("failed to create cddl directory %s: %w", dir, err)
	}
	schemas := make(map[string]*CddlSchema)
	skipped := 0

	err := filepath.WalkDir(dir, func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}

		if d.IsDir() || !strings.HasSuffix(d.Name(), ".cddl") {
			return nil
		}

		relPath, err := filepath.Rel(dir, path)
		if err != nil {
			return nil
		}

		id := strings.TrimSuffix(relPath, ".cddl")
		// Normalize path separators for stable IDs across platforms
		id = filepath.ToSlash(id)
		relPath = filepath.ToSlash(relPath)

		schema, err := r.loadSchemaFromFile(path, id, relPath)
		if err != nil {
			// a file that is there but cannot be read is the kind of thing that
			// looks like the schema never existed, so it is said out loud
			r.l.Warn("skipping unreadable cddl schema", "path", path, "error", err)
			skipped++
			return nil
		}

		r.l.Debug("found cddl schema", "id", id, "name", relPath, "bytes", len(schema.Content))
		schemas[id] = schema
		return nil
	})

	if err != nil {
		r.l.Error("cannot scan the cddl schemas directory", "dir", dir, "error", err)
		return nil, fmt.Errorf("failed to scan cddl directory: %w", err)
	}

	r.l.Info("scanned cddl schemas", "dir", dir, "found", len(schemas), "skipped", skipped)
	return schemas, nil
}

// GetById returns a CDDL schema by ID (relative path without extension)
func (r *FileSystemCddlRepo) GetById(id string) (*CddlSchema, error) {
	return r.GetByIdInPath(id, r.baseDir)
}

func (r *FileSystemCddlRepo) GetByIdInPath(id, dir string) (*CddlSchema, error) {
	if id == "" {
		return nil, errors.New("schema ID cannot be empty")
	}

	// Accept both slash styles in IDs from the API
	cleanID := filepath.Clean(filepath.FromSlash(id))
	// IDs come from the API: keep the lookup inside the schemas directory
	if filepath.IsAbs(cleanID) || cleanID == ".." || strings.HasPrefix(cleanID, ".."+string(filepath.Separator)) {
		// nobody reaches for a path outside the directory by accident
		r.l.Warn("refused a cddl schema id pointing outside the schemas directory", "id", id, "dir", dir)
		return nil, errors.New("schema not found")
	}
	filePath := filepath.Join(dir, cleanID+".cddl")
	relPath := filepath.ToSlash(cleanID + ".cddl")

	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		r.l.Warn("cddl schema not found", "id", id, "path", filePath)
		return nil, errors.New("schema not found")
	}

	schema, err := r.loadSchemaFromFile(filePath, filepath.ToSlash(cleanID), relPath)
	if err != nil {
		r.l.Error("cannot read cddl schema", "id", id, "path", filePath, "error", err)
		return nil, err
	}

	r.l.Debug("read cddl schema", "id", schema.ID, "path", filePath, "bytes", len(schema.Content))
	return schema, nil
}

func (r *FileSystemCddlRepo) loadSchemaFromFile(filePath, id, relPath string) (*CddlSchema, error) {
	content, err := os.ReadFile(filePath)
	if err != nil {
		return nil, fmt.Errorf("failed to read cddl file %s: %w", filePath, err)
	}

	return &CddlSchema{
		ID:      id,
		Name:    relPath,
		Content: string(content),
	}, nil
}
