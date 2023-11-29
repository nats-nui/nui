package ws

const (
	subReqType           = "subscriptions_req"
	natsMsgType          = "nats_msg"
	connectionStatusType = "connection_status"
	errorType            = "error"
)

type TypesMapping map[string]any

var typesMap = TypesMapping{
	natsMsgType:          NatsMsg{},
	connectionStatusType: ConnectionStatus{},
	subReqType:           SubsReq{},
}

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
	return natsMsgType
}

const Connected = "connected"
const Disconnected = "disconnected"
const Reconnecting = "reconnecting"

type ConnectionStatus struct {
	Status string `json:"status"`
}

func (s ConnectionStatus) GetType() string {
	return connectionStatusType
}

type Error struct {
	Error string `json:"error"`
}

func (s Error) GetType() string {
	return errorType
}

type SubsReq struct {
	Subjects []string `json:"subjects" mapstructure:"subjects"`
}

func (s SubsReq) GetType() string {
	return subReqType
}
