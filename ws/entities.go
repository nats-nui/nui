package ws

type Payload interface {
	GetType() string
}

type Message struct {
	Type    string `json:"type"`
	Payload any    `json:"payload"`
}

func NewWsMessage(p Payload) *Message {
	return &Message{
		Type:    p.GetType(),
		Payload: p,
	}
}

type NatsMsg struct {
	Subject string `json:"subject"`
	Payload []byte `json:"Payload"`
}

func (s NatsMsg) GetType() string {
	return "subscription"
}

const Connected = "connected"
const Disconnected = "disconnected"
const Reconnecting = "reconnecting"

type ConnectionStatus struct {
	Status string `json:"status"`
}

func (s ConnectionStatus) GetType() string {
	return "connection_status"
}

type Error struct {
	Error string `json:"error"`
}

func (e Error) GetType() string {
	return "error"
}

type SubsReq struct {
	Subjects []string `json:"subjects"`
}
