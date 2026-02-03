package protoschema

// ProtoRepo defines the interface for protobuf schema storage
type ProtoRepo interface {
	All() (map[string]*ProtoSchema, error)
	AllInPath(path string) (map[string]*ProtoSchema, error)
	GetById(id string) (*ProtoSchema, error)
	GetByIdInPath(id string, path string) (*ProtoSchema, error)
}
