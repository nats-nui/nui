package ws

import "time"

const (
	subReqType     = "subscriptions_req"
	natsMsgType    = "nats_msg"
	disconnectType = "disconnect_req"

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
	Subjects     []string `json:"subjects" mapstructure:"subjects"`
	TTLMinutes   int      `json:"ttl_minutes" mapstructure:"ttl_minutes"`     // Time-to-live in minutes (default: 15)
	MaxMessages  int      `json:"max_messages" mapstructure:"max_messages"`   // Max messages before auto-unsubscribe (default: 1000)
	SessionBased bool     `json:"session_based" mapstructure:"session_based"` // Remove on WebSocket disconnect (default: true)
}

func (s SubsReq) GetType() string {
	return subReqType
}

// DisconnectReq is sent by client when explicitly closing the window
type DisconnectReq struct{}

func (d DisconnectReq) GetType() string {
	return disconnectType
}

// Subscription expiry notification types
const (
	subExpiredType = "subscription_expired"
)

type SubExpired struct {
	Subject string `json:"subject"`
	Reason  string `json:"reason"` // "ttl", "max_messages", "disconnect", "limit"
}

func (s SubExpired) GetType() string {
	return subExpiredType
}

type MetricsReq struct {
	Enabled bool `json:"enabled" mapstructure:"enabled"`
}

func (s MetricsReq) GetType() string {
	return metricsReqType
}

type MetricsResp struct {
	Nats  map[string]map[string]any `json:"nats" mapstructure:"nats"`
	Error string                    `json:"error"`
}

func (s MetricsResp) GetType() string {
	return metricsMsg
}
