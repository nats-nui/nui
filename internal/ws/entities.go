package ws

import "time"

const (
	subReqType  = "subscriptions_req"
	natsMsgType = "nats_msg"

	connectionStatusType = "connection_status"

	metricsReqType = "metrics_req"
	metricsMsg     = "metrics_resp"

	errorType = "error"
)

type Payload interface {
	GetType() string
}

type Request struct {
	Type    string `json:"type"`
	Payload any    `json:"payload"`
}

type Response struct {
	Type    string `json:"type"`
	Payload any    `json:"payload"`
}

func NewWsMessage(p Payload) *Response {
	return &Response{
		Type:    p.GetType(),
		Payload: p,
	}
}

type NatsMsg struct {
	Subject    string              `json:"subject"`
	Payload    []byte              `json:"payload"`
	SeqNum     uint64              `json:"seq_num"`
	ReceivedAt time.Time           `json:"received_at"`
	Headers    map[string][]string `json:"headers"`
}

func (s NatsMsg) GetType() string {
	return natsMsgType
}

const Connected = "connected"
const Disconnected = "disconnected"
const Reconnected = "reconnected"

type ConnectionStatus struct {
	Status string `json:"status"`
	Error  string `json:"error"`
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

type MetricsReq struct {
	Enabled bool `json:"enabled" mapstructure:"enabled"`
}

func (s MetricsReq) GetType() string {
	return metricsReqType
}

type MetricsResp struct {
	Nats  map[string]any `json:"nats" mapstructure:"nats"`
	Error string         `json:"error"`
}

func (s MetricsResp) GetType() string {
	return metricsMsg
}
