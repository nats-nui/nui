package protoschema

// ProtoSchema represents a protobuf schema definition
type ProtoSchema struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Content     string `json:"content"`
	Description string `json:"description,omitempty"`
}
