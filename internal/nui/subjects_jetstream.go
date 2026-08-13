package nui

import (
	"context"
	"errors"
	"sort"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/nats-io/nats.go/jetstream"
)

// HandleJetStreamCatalog lists stream capture patterns. It does not walk
// occupied subject maps. KV and Object stores collapse to one bucket node.
func (a *App) HandleJetStreamCatalog(c *fiber.Ctx) error {
	if c.Params("id") == "" {
		return c.Status(422).JSON("id is required")
	}
	discardSys := queryBoolDefault(c, "discard_sys", true)

	js, ok, err := a.jsOrFailWithID(c)
	if !ok {
		return err
	}
	// Budget the list, not the WAN dial. A 2s+ public connect used to
	// consume this window and return zero streams.
	ctx, cancel := context.WithTimeout(c.Context(), jsCatalogTimeout)
	defer cancel()
	out := enumerateJetStreamPatterns(ctx, js, discardSys)
	return c.JSON(out)
}

// HandleJetStreamOccupied lists names that currently have messages in one
// stream. Per-stream cap. KV/Object are allowed but still capped.
func (a *App) HandleJetStreamOccupied(c *fiber.Ctx) error {
	if c.Params("id") == "" {
		return c.Status(422).JSON("id is required")
	}
	streamName := strings.TrimSpace(c.Params("stream"))
	if streamName == "" {
		return c.Status(422).JSON("stream is required")
	}
	discardSys := queryBoolDefault(c, "discard_sys", true)
	filter := strings.TrimSpace(c.Query("filter"))
	if filter == "" {
		filter = ">"
	}

	js, ok, err := a.jsOrFailWithID(c)
	if !ok {
		return err
	}
	ctx, cancel := context.WithTimeout(c.Context(), occupiedTimeout)
	defer cancel()
	out := occupiedSubjects(ctx, js, streamName, filter, discardSys)
	return c.JSON(out)
}

func enumerateJetStreamPatterns(ctx context.Context, js jetstream.JetStream, discardSys bool) *JetStreamCatalog {
	infos, err := collectStreamInfos(ctx, js)
	return catalogFromInfos(infos, err, discardSys)
}

func catalogFromInfos(infos []*jetstream.StreamInfo, listErr error, discardSys bool) *JetStreamCatalog {
	out := &JetStreamCatalog{Streams: []JetStreamStream{}}
	if listErr != nil {
		out.Error = jsUserError(listErr)
		if len(infos) == 0 {
			return out
		}
		out.Truncated = true
	}
	if len(infos) > maxJSStreams {
		out.Truncated = true
		infos = infos[:maxJSStreams]
	}

	for _, info := range infos {
		if info == nil {
			out.Failed++
			continue
		}
		kind := streamKind(info.Config.Name, info.Config.Subjects)
		entry := JetStreamStream{Name: info.Config.Name, Kind: kind, Subjects: []JetStreamSubject{}}
		seen := map[string]bool{}
		for _, pattern := range info.Config.Subjects {
			if discardSys && isInternalSubject(pattern) {
				continue
			}
			path, subKind := collapsePattern(pattern, kind)
			if seen[path] {
				continue
			}
			seen[path] = true
			next, capped := capAppend(entry.Subjects, JetStreamSubject{
				Subject: path,
				Pattern: pattern,
				Kind:    subKind,
			}, maxPatternsPerStream)
			entry.Subjects = next
			if capped {
				entry.Truncated = true
				break
			}
		}
		sort.Slice(entry.Subjects, func(i, j int) bool { return entry.Subjects[i].Subject < entry.Subjects[j].Subject })
		out.Streams = append(out.Streams, entry)
	}
	sort.Slice(out.Streams, func(i, j int) bool { return out.Streams[i].Name < out.Streams[j].Name })
	return out
}

func occupiedSubjects(ctx context.Context, js jetstream.JetStream, streamName, filter string, discardSys bool) *OccupiedCatalog {
	out := &OccupiedCatalog{Stream: streamName, Subjects: []JetStreamSubject{}}
	stream, err := js.Stream(ctx, streamName)
	if err != nil {
		out.Error = jsUserError(err)
		return out
	}
	info, err := stream.Info(ctx, jetstream.WithSubjectFilter(filter))
	if err != nil {
		out.Error = jsUserError(err)
		return out
	}
	out.Kind = streamKind(info.Config.Name, info.Config.Subjects)
	for subject, count := range info.State.Subjects {
		if discardSys && isInternalSubject(subject) {
			continue
		}
		next, capped := capAppend(out.Subjects, JetStreamSubject{
			Subject: subject,
			Kind:    kindOccupied,
			Count:   count,
		}, maxOccupiedPerStream)
		out.Subjects = next
		if capped {
			out.Truncated = true
			break
		}
	}
	sort.Slice(out.Subjects, func(i, j int) bool { return out.Subjects[i].Subject < out.Subjects[j].Subject })
	return out
}

func collectStreamInfos(ctx context.Context, js jetstream.JetStream) ([]*jetstream.StreamInfo, error) {
	listener := js.ListStreams(ctx)
	var infos []*jetstream.StreamInfo
	for {
		select {
		case info, ok := <-listener.Info():
			if !ok {
				if err := listener.Err(); err != nil {
					return infos, err
				}
				return infos, nil
			}
			if info != nil {
				infos = append(infos, info)
			}
		case <-ctx.Done():
			return infos, ctx.Err()
		}
	}
}

func jsUserError(err error) string {
	if err == nil {
		return ""
	}
	if errors.Is(err, context.Canceled) || errors.Is(err, context.DeadlineExceeded) {
		return "timed out"
	}
	s := strings.ToLower(err.Error())
	if strings.Contains(s, "permission") || strings.Contains(s, "authorization") || strings.Contains(s, "not permitted") {
		return "not allowed"
	}
	if strings.Contains(s, "not enabled") || strings.Contains(s, "no jetstream") || strings.Contains(s, "503") {
		return "not enabled on this server"
	}
	return err.Error()
}

func sortCoreSubjects(subjects []CoreSubject) {
	sort.Slice(subjects, func(i, j int) bool { return subjects[i].Subject < subjects[j].Subject })
}
