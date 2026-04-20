package ws

import "time"

const (
	subReqType  = "subscriptions_req"
	natsMsgType = "nats_msg"

	connectionStatusType = "connection_status"

	metricsReqType = "metrics_req"
	metricsMsg     = "metrics_resp"

	consumerClientsReqType  = "consumer_clients_req"
	consumerClientsRespType = "consumer_clients_resp"

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
	Nats  map[string]map[string]any `json:"nats" mapstructure:"nats"`
	Error string                    `json:"error"`
}

func (s MetricsResp) GetType() string {
	return metricsMsg
}

// ConsumerClientsReq requests clients matching a consumer's subscription
type ConsumerClientsReq struct {
	StreamName     string `json:"stream_name" mapstructure:"stream_name"`
	ConsumerName   string `json:"consumer_name" mapstructure:"consumer_name"`
	DeliverSubject string `json:"deliver_subject" mapstructure:"deliver_subject"`
	FilterSubject  string `json:"filter_subject" mapstructure:"filter_subject"`
}

func (s ConsumerClientsReq) GetType() string {
	return consumerClientsReqType
}

// ConsumerClientsResp returns matching client connections
type ConsumerClientsResp struct {
	StreamName   string           `json:"stream_name"`
	ConsumerName string           `json:"consumer_name"`
	Clients      []map[string]any `json:"clients"`
	Error        string           `json:"error"`
}

func (s ConsumerClientsResp) GetType() string {
	return consumerClientsRespType
}
