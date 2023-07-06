package ws

type Message struct {
	Subject  string   `json:"subject"`
	Payload  []byte   `json:"Payload"`
	Metadata Metadata `json:"metadata"`
}

type Error struct {
	Error string `json:"error"`
}

type Metadata struct {
}

type Request struct {
	ConnectionId string   `json:"connection_id"`
	Subjects     []string `json:"subjects"`
}
