package cddlschema

// CddlRepo defines the interface for CDDL schema storage
type CddlRepo interface {
	All() (map[string]*CddlSchema, error)
	AllInPath(path string) (map[string]*CddlSchema, error)
	GetById(id string) (*CddlSchema, error)
	GetByIdInPath(id string, path string) (*CddlSchema, error)
}
