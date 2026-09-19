package nui

import (
	"context"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/nats-io/nats.go/jetstream"
	"github.com/nats-nui/nui/internal/ws"
)

const (
	defaultListenMs      = 2000
	minListenMs          = 200
	maxListenMs          = 10000
	maxCoreSubjects      = 5000
	maxJSStreams         = 500
	maxPatternsPerStream = 500
	maxOccupiedPerStream = 500
	coreSubscribeBuffer  = 256
	corePendingMsgs      = 256
	corePendingBytes     = 256 * 1024
	jsCatalogTimeout     = 8 * time.Second
	occupiedTimeout      = 8 * time.Second
)

type CoreCatalog struct {
	Filter    string        `json:"filter"`
	ListenMs  int           `json:"listen_ms"`
	Heard     int           `json:"heard"`
	Truncated bool          `json:"truncated"`
	Dropped   int           `json:"dropped,omitempty"`
	Error     string        `json:"error,omitempty"`
	Watching  bool          `json:"watching,omitempty"`
	Subjects  []CoreSubject `json:"subjects"`
}

type CoreSubject struct {
	Subject string `json:"subject"`
	Count   int    `json:"count"`
}

type JetStreamCatalog struct {
	Error     string            `json:"error,omitempty"`
	Failed    int               `json:"failed,omitempty"`
	Truncated bool              `json:"truncated,omitempty"`
	Streams   []JetStreamStream `json:"streams"`
}

type JetStreamStream struct {
	Name      string             `json:"name"`
	Kind      string             `json:"kind"`
	Truncated bool               `json:"truncated,omitempty"`
	Subjects  []JetStreamSubject `json:"subjects"`
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

// HandleSubjectLast returns the last stored JetStream message for a subject.
// Core has no stored last message. Catalogs never include payloads.
func (a *App) HandleSubjectLast(c *fiber.Ctx) error {
	if c.Params("id") == "" {
		return c.Status(422).JSON("id is required")
	}
	subject := strings.TrimSpace(c.Query("subject"))
	if validateListenFilter(subject) != nil || strings.ContainsAny(subject, "*>") {
		return c.Status(422).JSON(NewError("a subject name is required"))
	}
	streamName := strings.TrimSpace(c.Query("stream"))
	if streamName == "" {
		return c.Status(422).JSON("stream is required")
	}

	js, ok, err := a.jsOrFailWithID(c)
	if !ok {
		return err
	}
	ctx, cancel := context.WithTimeout(c.Context(), occupiedTimeout)
	defer cancel()
	stream, err := js.Stream(ctx, streamName)
	if err != nil {
		return a.logAndFiberError(c, err, 422)
	}
	raw, err := stream.GetLastMsgForSubject(ctx, subject)
	if err != nil {
		return a.logAndFiberError(c, err, 404)
	}
	return c.JSON(ws.NatsMsg{
		Subject:    raw.Subject,
		Payload:    raw.Data,
		SeqNum:     raw.Sequence,
		ReceivedAt: raw.Time,
		Headers:    raw.Header,
	})
}

func (a *App) jsOrFailWithID(c *fiber.Ctx) (jetstream.JetStream, bool, error) {
	conn, err := a.nui.ConnPool.Get(c.Params("id"))
	if err != nil {
		return nil, false, a.logAndFiberError(c, err, 422)
	}
	js, err := jetstream.New(conn.Conn)
	if err != nil {
		return nil, false, a.logAndFiberError(c, err, 422)
	}
	return js, true, nil
}
