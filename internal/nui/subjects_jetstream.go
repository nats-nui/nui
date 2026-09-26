package nui

import (
	"context"
	"encoding/json"
	"errors"
	"sort"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/nats-io/nats.go/jetstream"
)

// HandleJetStreamCatalog lists stream capture patterns and buckets.
func (a *App) HandleJetStreamCatalog(c *fiber.Ctx) error {
	if c.Params("connection_id") == "" {
		return c.Status(422).JSON("id is required")
	}

	js, ok, err := a.jsOrFail(c)
	if !ok {
		return err
	}
	ctx, cancel := context.WithTimeout(c.Context(), jsCatalogTimeout)
	defer cancel()
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
	filter := normalizeListenFilter(c.Query("filter"))
	if filter == "" {
		filter = ">"
	}
	if err := validateListenFilter(filter); err != nil {
		return c.Status(422).JSON(NewError(err.Error()))
	}

	js, ok, err := a.jsOrFail(c)
	if !ok {
		return err
	}
	ctx, cancel := context.WithTimeout(c.Context(), occupiedTimeout)
	defer cancel()
	out := occupiedSubjects(ctx, js, streamName, filter, c.QueryBool("discard_sys", true))
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
		kind := streamKind(info.Config.Name, info.Config.Subjects)
		entry := JetStreamStream{Name: info.Config.Name, Kind: kind, Subjects: []JetStreamSubject{}}
		seen := map[string]bool{}
		for _, pattern := range info.Config.Subjects {
			if hideInternal(discardSys, pattern) {
				continue
			}
			path, subKind := collapsePattern(pattern, kind)
			if seen[path] {
				continue
			}
			seen[path] = true
			if len(entry.Subjects) >= maxPatternsPerStream {
				entry.Truncated = true
				break
			}
			if subKind == kindObject {
				pattern = path + ".>"
			}
			entry.Subjects = append(entry.Subjects, JetStreamSubject{
				Subject: path,
				Pattern: pattern,
				Kind:    subKind,
			})
		}
		sort.Slice(entry.Subjects, func(i, j int) bool { return entry.Subjects[i].Subject < entry.Subjects[j].Subject })
		out.Streams = append(out.Streams, entry)
	}
	sort.Slice(out.Streams, func(i, j int) bool { return out.Streams[i].Name < out.Streams[j].Name })
	return out
}

func occupiedSubjects(ctx context.Context, js jetstream.JetStream, streamName, filter string, discardSys bool) *OccupiedCatalog {
	out := &OccupiedCatalog{Stream: streamName, Subjects: []JetStreamSubject{}}
	_, err := js.Stream(ctx, streamName)
	if err != nil {
		out.Error = jsUserError(err)
		return out
	}
	// Stream.Info walks every page. Discovery only needs the first page.
	request, err := json.Marshal(struct {
		Filter string `json:"subjects_filter"`
	}{filter})
	if err != nil {
		out.Error = jsUserError(err)
		return out
	}
	response, err := js.Conn().RequestWithContext(ctx, "$JS.API.STREAM.INFO."+streamName, request)
	if err != nil {
		out.Error = jsUserError(err)
		return out
	}
	var page struct {
		jetstream.StreamInfo
		Total int                 `json:"total"`
		Error *jetstream.APIError `json:"error"`
	}
	if err := json.Unmarshal(response.Data, &page); err != nil {
		out.Error = jsUserError(err)
		return out
	}
	if page.Error != nil {
		out.Error = jsUserError(page.Error)
		return out
	}
	info := &page.StreamInfo
	out.Truncated = page.Total > len(info.State.Subjects)
	out.Kind = streamKind(info.Config.Name, info.Config.Subjects)
	// Sort before the cap so every poll shows the same first page.
	names := make([]string, 0, len(info.State.Subjects))
	for subject := range info.State.Subjects {
		if hideInternal(discardSys, subject) {
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

func collectStreamInfos(ctx context.Context, js jetstream.JetStream) ([]*jetstream.StreamInfo, error) {
	ctx, cancel := context.WithCancel(ctx)
	defer cancel()
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
				if len(infos) > maxJSStreams {
					cancel()
					return infos, nil
				}
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
