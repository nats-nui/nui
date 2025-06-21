package metrics

import "time"

const (
	SourceHttp = "source_http"
	SourceNats = "source_nats"
)

type ServiceCfg struct {
	ConnectionId      string `json:"connection_id"`
	PollingIntervalMs int    `json:"polling_interval"`
}

type Metrics struct {
	RetrievedAt time.Time      `json:"retrieved_at"`
	Nats        map[string]any `json:"nats,omitempty"`
	Error       error          `json:"error,omitempty"`
}
