package nui

import (
	"context"
	"errors"
	"strings"
	"time"

	"github.com/nats-io/nats.go"
	"github.com/nats-io/nats.go/jetstream"
)

const (
	defaultListenMs      = 2000
	minListenMs          = 200
	maxListenMs          = 10000
	maxCoreSubjects      = 5000
	maxJSStreams         = 500
	maxPatternsPerStream = 500
	maxOccupiedPerStream = 500
	corePendingBytes     = 256 * 1024
	jsDiscoveryTimeout   = 8 * time.Second
)

type CoreCatalog struct {
	Filter    string        `json:"filter"`
	ListenMs  int           `json:"listen_ms"`
	Heard     int           `json:"heard"`
	Truncated bool          `json:"truncated"`
	Dropped   int           `json:"dropped,omitempty"`
	Error     string        `json:"error,omitempty"`
	Subjects  []CoreSubject `json:"subjects"`
}

type CoreSubject struct {
	Subject string `json:"subject"`
	Count   int    `json:"count"`
}

type JetStreamCatalog struct {
	Error     string            `json:"error,omitempty"`
	Truncated bool              `json:"truncated,omitempty"`
	Streams   []JetStreamStream `json:"streams"`
}

type JetStreamStream struct {
	Transformed bool               `json:"transformed,omitempty"`
	Name        string             `json:"name"`
	Kind        string             `json:"kind"`
	Truncated   bool               `json:"truncated,omitempty"`
	Subjects    []JetStreamSubject `json:"subjects"`
}

type JetStreamSubject struct {
	Subject string `json:"subject"`
	Pattern string `json:"pattern,omitempty"`
	Kind    string `json:"kind"`
	Count   uint64 `json:"count,omitempty"`
}

type OccupiedCatalog struct {
	Stream    string             `json:"stream"`
	Kind      string             `json:"kind"`
	Truncated bool               `json:"truncated,omitempty"`
	Error     string             `json:"error,omitempty"`
	Subjects  []JetStreamSubject `json:"subjects"`
}

// Raw broker and dial errors can contain credential paths and connection URLs.
func subjectDiscoveryError(err error) string {
	switch {
	case err == nil:
		return ""
	case errors.Is(err, context.Canceled):
		return "interrupted"
	case errors.Is(err, context.DeadlineExceeded), errors.Is(err, nats.ErrTimeout):
		return "timed out"
	case errors.Is(err, nats.ErrSlowConsumer):
		return "too much traffic"
	case errors.Is(err, nats.ErrConnectionClosed):
		return "connection closed"
	case errors.Is(err, jetstream.ErrStreamNotFound):
		return "stream not found"
	case errors.Is(err, jetstream.ErrJetStreamNotEnabled):
		return "not enabled on this server"
	}
	message := strings.ToLower(err.Error())
	switch {
	case strings.Contains(message, "permission"), strings.Contains(message, "authorization"), strings.Contains(message, "not permitted"):
		return "not allowed"
	case strings.Contains(message, "jetstream not enabled"):
		return "not enabled on this server"
	default:
		return "subject discovery failed"
	}
}
