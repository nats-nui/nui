package proto

// ProtoSchema represents a protobuf schema definition
type ProtoSchema struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Content     string `json:"content"`
	Description string `json:"description,omitempty"`
}

// ProtoRepo defines the interface for protobuf schema storage
type ProtoRepo interface {
	All() (map[string]*ProtoSchema, error)
	GetById(id string) (*ProtoSchema, error)
}