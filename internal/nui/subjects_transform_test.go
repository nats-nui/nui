package nui

import (
	"context"
	"testing"

	"github.com/nats-io/nats.go"
	"github.com/nats-io/nats.go/jetstream"
	"github.com/stretchr/testify/require"
)

func TestOccupiedTransformedCaptureIsNotReportedEmpty(t *testing.T) {
	for _, tc := range []struct {
		name      string
		capture   string
		transform jetstream.SubjectTransformConfig
		published string
		stored    string
	}{
		{
			name: "prefix", capture: "orders.>",
			transform: jetstream.SubjectTransformConfig{Source: "orders.>", Destination: "stored.>"},
			published: "orders.created", stored: "stored.created",
		},
		{
			name: "partial", capture: "orders.>",
			transform: jetstream.SubjectTransformConfig{Source: "orders.created", Destination: "stored.created"},
			published: "orders.created", stored: "stored.created",
		},
		{
			name: "literal", capture: "orders.created",
			transform: jetstream.SubjectTransformConfig{Source: "orders.created", Destination: "stored.created"},
			published: "orders.created", stored: "stored.created",
		},
	} {
		t.Run(tc.name, func(t *testing.T) {
			ns := startTestNATS(t, jsOpts(t))
			nc, err := nats.Connect(ns.ClientURL())
			require.NoError(t, err)
			defer nc.Close()
			js, err := jetstream.New(nc)
			require.NoError(t, err)
			ctx := context.Background()
			stream, err := js.CreateStream(ctx, jetstream.StreamConfig{
				Name: "TRANSFORMED", Subjects: []string{tc.capture}, Storage: jetstream.MemoryStorage,
				SubjectTransform: &tc.transform,
			})
			require.NoError(t, err)
			_, err = js.Publish(ctx, tc.published, []byte("present"))
			require.NoError(t, err)

			catalog := enumerateJetStreamPatterns(ctx, js, true)
			require.Empty(t, catalog.Error)
			require.Len(t, catalog.Streams, 1)
			require.True(t, catalog.Streams[0].Transformed)
			require.Len(t, catalog.Streams[0].Subjects, 1)
			require.Equal(t, tc.capture, catalog.Streams[0].Subjects[0].Pattern)

			// A capture filter describes incoming names. An empty stored list
			// would incorrectly imply the transformed messages do not exist.
			occupied := occupiedSubjects(ctx, js, "TRANSFORMED", tc.capture, true)
			require.Contains(t, occupied.Error, "transforms subject names")
			require.Empty(t, occupied.Subjects)

			// The bounded stream-wide inventory remains meaningful, and its
			// literal subjects can still retrieve the last stored message.
			all := occupiedSubjects(ctx, js, "TRANSFORMED", ">", true)
			require.Empty(t, all.Error)
			require.Len(t, all.Subjects, 1)
			require.Equal(t, tc.stored, all.Subjects[0].Subject)
			last, err := stream.GetLastMsgForSubject(ctx, all.Subjects[0].Subject)
			require.NoError(t, err)
			require.Equal(t, []byte("present"), last.Data)
		})
	}
}

func TestOccupiedNormalPatternsAndBuckets(t *testing.T) {
	ns := startTestNATS(t, jsOpts(t))
	nc, err := nats.Connect(ns.ClientURL())
	require.NoError(t, err)
	defer nc.Close()
	js, err := jetstream.New(nc)
	require.NoError(t, err)
	ctx := context.Background()
	_, err = js.CreateStream(ctx, jetstream.StreamConfig{
		Name: "ORDERS", Subjects: []string{"orders.>"}, Storage: jetstream.MemoryStorage,
	})
	require.NoError(t, err)
	_, err = js.Publish(ctx, "orders.created", []byte("order"))
	require.NoError(t, err)
	kv, err := js.CreateKeyValue(ctx, jetstream.KeyValueConfig{Bucket: "shop", Storage: jetstream.MemoryStorage})
	require.NoError(t, err)
	_, err = kv.Put(ctx, "item", []byte("value"))
	require.NoError(t, err)
	objects, err := js.CreateObjectStore(ctx, jetstream.ObjectStoreConfig{Bucket: "files", Storage: jetstream.MemoryStorage})
	require.NoError(t, err)
	_, err = objects.PutBytes(ctx, "note", []byte("file"))
	require.NoError(t, err)

	wantPatterns := map[string]string{"ORDERS": "orders.>", "KV_shop": "$KV.shop.>", "OBJ_files": "$O.files.>"}
	catalog := enumerateJetStreamPatterns(ctx, js, true)
	require.Empty(t, catalog.Error)
	require.Len(t, catalog.Streams, len(wantPatterns))
	for _, stream := range catalog.Streams {
		require.False(t, stream.Transformed)
		require.Len(t, stream.Subjects, 1)
		require.Equal(t, wantPatterns[stream.Name], stream.Subjects[0].Pattern)
		occupied := occupiedSubjects(ctx, js, stream.Name, stream.Subjects[0].Pattern, true)
		require.Empty(t, occupied.Error)
		require.NotEmpty(t, occupied.Subjects)
	}
}
