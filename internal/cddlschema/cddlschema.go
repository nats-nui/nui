package cddlschema

// CddlSchema represents a CDDL schema definition loaded from the filesystem
type CddlSchema struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Content     string `json:"content"`
	Description string `json:"description,omitempty"`
}
