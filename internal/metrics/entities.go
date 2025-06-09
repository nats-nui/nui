package metrics

import "github.com/nats-nui/nui/internal/connection"

const (
	SourceHttp = "source_http"
	SourceNats = "source_nats"
)

type ServiceCfg struct {
	serverAddr string
	source     string
	SysAccount connection.Auth
}

type Metrics struct {
	Nats map[string]any `json:"nats,omitempty"`
}
