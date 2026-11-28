package nui

import (
	"context"
	"encoding/json"
	"sort"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/nats-io/nats.go/jetstream"
	"github.com/nats-nui/nui/internal/connection"
)

// HandleJetStreamCatalog lists stream capture patterns and buckets.
func (a *App) HandleJetStreamCatalog(c *fiber.Ctx) error {
	if c.Params("connection_id") == "" {
		return c.Status(422).JSON("id is required")
	}

	ctx, cancel := context.WithTimeout(a.ctx, jsDiscoveryTimeout)
	defer cancel()
	js, err := a.discoveryJetStream(ctx, c.Params("connection_id"))
	if err != nil {
		return c.Status(422).JSON(NewError(subjectDiscoveryError(err)))
	}
	defer js.Conn().Close()
	out := enumerateJetStreamPatterns(ctx, js, c.QueryBool("discard_sys", true))
	return c.JSON(out)
}

// HandleJetStreamOccupied lists subjects with stored messages in a stream.
func (a *App) HandleJetStreamOccupied(c *fiber.Ctx) error {
	if c.Params("connection_id") == "" {
		return c.Status(422).JSON("id is required")
	}
	streamName := strings.TrimSpace(c.Params("stream"))
	if streamName == "" {
		return c.Status(422).JSON("stream is required")
	}
	filter := strings.TrimSpace(c.Query("filter"))
	if filter == "" {
		filter = ">"
	}
	if err := validateListenFilter(filter); err != nil {
		return c.Status(422).JSON(NewError(err.Error()))
	}

	ctx, cancel := context.WithTimeout(a.ctx, jsDiscoveryTimeout)
	defer cancel()
	js, err := a.discoveryJetStream(ctx, c.Params("connection_id"))
	if err != nil {
		return c.Status(422).JSON(NewError(subjectDiscoveryError(err)))
	}
	defer js.Conn().Close()
	out := occupiedSubjects(ctx, js, streamName, filter, c.QueryBool("discard_sys", true))
	return c.JSON(out)
}

// A discovery request owns its dial and connection so expiration interrupts
// the handshake without closing a connection shared with other cards.
func (a *App) discoveryJetStream(ctx context.Context, id string) (jetstream.JetStream, error) {
	cfg, err := a.nui.ConnRepo.GetById(id)
	if err != nil {
		return nil, err
	}
	nc, err := connection.DialOnce(ctx, cfg)
	if err != nil {
		return nil, err
	}
	js, err := jetstream.New(nc)
	if err != nil {
		nc.Close()
		return nil, err
	}
	return js, nil
}

func enumerateJetStreamPatterns(ctx context.Context, js jetstream.JetStream, discardSys bool) *JetStreamCatalog {
	ctx, cancel := context.WithCancel(ctx)
	defer cancel()
	return catalogFromLister(js.ListStreams(ctx), discardSys)
}

func catalogFromLister(listener jetstream.StreamInfoLister, discardSys bool) *JetStreamCatalog {
	out := &JetStreamCatalog{Streams: []JetStreamStream{}}
	for info := range listener.Info() {
		if info == nil {
			continue
		}
		if len(out.Streams) == maxJSStreams {
			out.Truncated = true
			break
		}
		patterns := info.Config.Subjects
		kind, bucket := streamBucket(info.Config.Name, patterns)
		entry := JetStreamStream{Name: info.Config.Name, Kind: kind, Transformed: info.Config.SubjectTransform != nil, Subjects: []JetStreamSubject{}}
		subKind := kindPattern
		if bucket != "" {
			patterns = []string{bucket}
			subKind = kind
		}
		for _, pattern := range patterns {
			if discardSys && isInternalSubject(pattern) {
				continue
			}
			if len(entry.Subjects) >= maxPatternsPerStream {
				entry.Truncated = true
				break
			}
			entry.Subjects = append(entry.Subjects, JetStreamSubject{
				Subject: pattern,
				Pattern: pattern,
				Kind:    subKind,
			})
		}
		sort.Slice(entry.Subjects, func(i, j int) bool { return entry.Subjects[i].Subject < entry.Subjects[j].Subject })
		out.Streams = append(out.Streams, entry)
	}
	// Err is safe to read after the SDK closes the channel.
	if !out.Truncated {
		if err := listener.Err(); err != nil {
			out.Error = subjectDiscoveryError(err)
			out.Truncated = len(out.Streams) != 0
		}
	}
	sort.Slice(out.Streams, func(i, j int) bool { return out.Streams[i].Name < out.Streams[j].Name })
	return out
}

func occupiedSubjects(ctx context.Context, js jetstream.JetStream, streamName, filter string, discardSys bool) *OccupiedCatalog {
	out := &OccupiedCatalog{Stream: streamName, Subjects: []JetStreamSubject{}}
	// The raw API request needs the same stream-name restrictions as js.Stream.
	if streamName == "" || strings.ContainsAny(streamName, ">*. /\\\t\r\n") {
		out.Error = "invalid stream name"
		return out
	}
	// Stream.Info walks every page. Discovery only needs the first page.
	request, err := json.Marshal(struct {
		Filter string `json:"subjects_filter"`
	}{filter})
	if err != nil {
		out.Error = subjectDiscoveryError(err)
		return out
	}
	response, err := js.Conn().RequestWithContext(ctx, "$JS.API.STREAM.INFO."+streamName, request)
	if err != nil {
		out.Error = subjectDiscoveryError(err)
		return out
	}
	// The client already buffered the response. Bound subsequent JSON decoding,
	// map allocation and sorting even when the broker returns a very large page.
	const maxOccupiedPageBytes = 1 << 20
	if len(response.Data) > maxOccupiedPageBytes {
		out.Truncated = true
		out.Error = "The stored subject list is too large to display."
		return out
	}
	var page struct {
		jetstream.StreamInfo
		Total int                 `json:"total"`
		Error *jetstream.APIError `json:"error"`
	}
	if err := json.Unmarshal(response.Data, &page); err != nil {
		out.Error = subjectDiscoveryError(err)
		return out
	}
	if page.Error != nil {
		out.Error = subjectDiscoveryError(page.Error)
		return out
	}
	info := &page.StreamInfo
	// Capture patterns cannot reliably filter stored names after a subject transform.
	if info.Config.SubjectTransform != nil && filter != ">" {
		out.Error = "Stored subjects cannot be matched to this pattern because the stream transforms subject names."
		return out
	}
	out.Truncated = page.Total > len(info.State.Subjects)
	out.Kind, _ = streamBucket(info.Config.Name, info.Config.Subjects)
	names := make([]string, 0, len(info.State.Subjects))
	for subject := range info.State.Subjects {
		if discardSys && isInternalSubject(subject) {
			continue
		}
		names = append(names, subject)
	}
	sort.Strings(names)
	if len(names) > maxOccupiedPerStream {
		out.Truncated = true
		names = names[:maxOccupiedPerStream]
	}
	out.Subjects = make([]JetStreamSubject, 0, len(names))
	for _, subject := range names {
		out.Subjects = append(out.Subjects, JetStreamSubject{
			Subject: subject,
			Kind:    kindOccupied,
			Count:   info.State.Subjects[subject],
		})
	}
	return out
}
