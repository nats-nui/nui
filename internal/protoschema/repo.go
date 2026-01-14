package protoschema

// ProtoRepo defines the interface for protobuf schema storage
type ProtoRepo interface {
	All() (map[string]*ProtoSchema, error)
	GetById(id string) (*ProtoSchema, error)
}
