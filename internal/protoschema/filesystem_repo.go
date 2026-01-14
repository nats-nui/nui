package protoschema

import (
	"errors"
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"strings"
)

// FileSystemProtoRepo implements ProtoRepo using filesystem storage
type FileSystemProtoRepo struct {
	baseDir string
}

// NewFileSystemProtoRepo creates a new filesystem-based protobuf schema repository
func NewFileSystemProtoRepo(baseDir string) (ProtoRepo, error) {
	// Create directory if it doesn't exist
	if err := os.MkdirAll(baseDir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create proto directory %s: %w", baseDir, err)
	}

	return &FileSystemProtoRepo{baseDir: baseDir}, nil
}

// All returns all protobuf schemas from the filesystem
func (r *FileSystemProtoRepo) All() (map[string]*ProtoSchema, error) {
	schemas := make(map[string]*ProtoSchema)

	err := filepath.WalkDir(r.baseDir, func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}

		// Skip directories and non-.proto files
		if d.IsDir() || !strings.HasSuffix(d.Name(), ".proto") {
			return nil
		}

		// Get relative path from base directory (e.g., "opentelemetry/proto/common/v1/common.proto")
		relPath, err := filepath.Rel(r.baseDir, path)
		if err != nil {
			return nil
		}

		// Use relative path as ID (without extension)
		id := strings.TrimSuffix(relPath, ".proto")

		schema, err := r.loadSchemaFromFile(path, id, relPath)
		if err != nil {
			// Skip malformed files but log the error
			return nil
		}

		schemas[id] = schema
		return nil
	})

	if err != nil {
		return nil, fmt.Errorf("failed to scan proto directory: %w", err)
	}

	return schemas, nil
}

// GetById returns a protobuf schema by ID (relative path without extension)
func (r *FileSystemProtoRepo) GetById(id string) (*ProtoSchema, error) {
	if id == "" {
		return nil, errors.New("schema ID cannot be empty")
	}

	filePath := filepath.Join(r.baseDir, id+".proto")
	relPath := id + ".proto"

	// Check if file exists
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		return nil, errors.New("schema not found")
	}

	return r.loadSchemaFromFile(filePath, id, relPath)
}

// loadSchemaFromFile loads a ProtoSchema from a file
func (r *FileSystemProtoRepo) loadSchemaFromFile(filePath, id, relPath string) (*ProtoSchema, error) {
	content, err := os.ReadFile(filePath)
	if err != nil {
		return nil, fmt.Errorf("failed to read proto file %s: %w", filePath, err)
	}

	schema := &ProtoSchema{
		ID:      id,
		Name:    relPath, // Use relative path as name for proper import resolution
		Content: string(content),
	}

	return schema, nil
}
