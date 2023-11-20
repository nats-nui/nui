package ws

type StrType interface {
	StrType() string
}

type Message struct {
	Type    string `json:"type"`
	Payload any    `json:"payload"`
}

type NatsMsg struct {
	Subject string `json:"subject"`
	Payload []byte `json:"Payload"`
}

func (s NatsMsg) StrType() string {
	return "subscription"
}

const Connected = "connected"
const Disconnected = "disconnected"
const Reconnecting = "reconnecting"

type ConnectionStatus struct {
	Status string `json:"status"`
}

func (s ConnectionStatus) StrType() string {
	return "connection_status"
}

type Error struct {
	Error string `json:"error"`
}

func (e Error) StrType() string {
	return "error"
}

type Request struct {
	ConnectionId string   `json:"connection_id"`
	Subjects     []string `json:"subjects"`
}
