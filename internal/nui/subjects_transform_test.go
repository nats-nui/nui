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

	want := map[string]JetStreamSubject{
		"ORDERS":    {Subject: "orders.>", Pattern: "orders.>", Kind: kindPattern},
		"KV_shop":   {Subject: "$KV.shop.>", Pattern: "$KV.shop.>", Kind: kindKV},
		"OBJ_files": {Subject: "$O.files.>", Pattern: "$O.files.>", Kind: kindObject},
	}
	for _, tc := range []struct{ name, pattern, subject string }{
		{"KV_split", "$KV.split.a.>", "$KV.split.a.one"},
		{"PART_B", "$KV.split.b.>", "$KV.split.b.one"},
		{"OBJ_split", "$O.split.C.>", "$O.split.C.one"},
		{"PART_D", "$O.split.M.>", "$O.split.M.one"},
		{"KV_PREFIX", "$KV.shop", "$KV.shop"},
		{"OBJ_PREFIX", "$O.files", "$O.files"},
	} {
		_, err = js.CreateStream(ctx, jetstream.StreamConfig{
			Name: tc.name, Subjects: []string{tc.pattern}, Storage: jetstream.MemoryStorage,
		})
		require.NoError(t, err)
		_, err = js.Publish(ctx, tc.subject, []byte("value"))
		require.NoError(t, err)
		want[tc.name] = JetStreamSubject{Subject: tc.pattern, Pattern: tc.pattern, Kind: kindPattern}
	}
	catalog := enumerateJetStreamPatterns(ctx, js, true)
	require.Empty(t, catalog.Error)
	require.Len(t, catalog.Streams, len(want))
	for _, stream := range catalog.Streams {
		require.False(t, stream.Transformed)
		require.Equal(t, []JetStreamSubject{want[stream.Name]}, stream.Subjects)
		occupied := occupiedSubjects(ctx, js, stream.Name, stream.Subjects[0].Pattern, true)
		require.Empty(t, occupied.Error)
		require.Equal(t, stream.Name, occupied.Stream)
		require.NotEmpty(t, occupied.Subjects)
	}
}
