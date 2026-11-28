package nui

import (
	"bytes"
	"context"
	"encoding/json"
	"strconv"
	"testing"
	"time"

	"github.com/nats-io/nats-server/v2/server"
	"github.com/nats-io/nats.go"
	"github.com/nats-io/nats.go/jetstream"
	"github.com/stretchr/testify/require"
)

func TestJetStreamCatalogReportsStreamCap(t *testing.T) {
	infos := make([]*jetstream.StreamInfo, maxJSStreams+1)
	for i := range infos {
		infos[i] = &jetstream.StreamInfo{Config: jetstream.StreamConfig{Name: strconv.Itoa(i)}}
	}
	for _, count := range []int{maxJSStreams, maxJSStreams + 1} {
		catalog := catalogFromLister(testStreamList{infos: infos[:count]}, true)
		require.Empty(t, catalog.Error)
		require.Len(t, catalog.Streams, maxJSStreams)
		require.Equal(t, count > maxJSStreams, catalog.Truncated)
	}
}

func TestOccupiedDoesNotWalkEveryPage(t *testing.T) {
	nc := testNATSConnection(t, nil)
	_, err := nc.Subscribe("$JS.API.STREAM.INFO.MANY", func(m *nats.Msg) {
		var request struct {
			Offset int `json:"offset"`
		}
		_ = json.Unmarshal(m.Data, &request)
		if request.Offset != 0 {
			return
		}
		_ = m.Respond([]byte(`{"total":100001,"limit":100000,"config":{"name":"MANY","subjects":["orders.>"]},"state":{"subjects":{"orders.created":1}}}`))
	})
	require.NoError(t, err)
	require.NoError(t, nc.Flush())
	js, err := jetstream.New(nc)
	require.NoError(t, err)
	ctx, cancel := context.WithTimeout(context.Background(), time.Second)
	defer cancel()
	cat := occupiedSubjects(ctx, js, "MANY", "orders.>", true)
	require.Empty(t, cat.Error)
	require.True(t, cat.Truncated)
	require.Len(t, cat.Subjects, 1)
}

func TestOccupiedRejectsOversizePageBeforeDecode(t *testing.T) {
	nc := testNATSConnection(t, &server.Options{MaxPayload: 2 << 20})
	page := append([]byte(`{"config":{"name":"MANY"},"state":{}}`), bytes.Repeat([]byte(" "), 1<<20)...)
	_, err := nc.Subscribe("$JS.API.STREAM.INFO.MANY", func(m *nats.Msg) { _ = m.Respond(page) })
	require.NoError(t, err)
	require.NoError(t, nc.Flush())
	js, err := jetstream.New(nc)
	require.NoError(t, err)
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()
	result := occupiedSubjects(ctx, js, "MANY", ">", true)
	require.True(t, result.Truncated)
	require.Contains(t, result.Error, "too large")
	require.Empty(t, result.Subjects)
}
