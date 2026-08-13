package nui

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/nats-io/nats-server/v2/server"
	"github.com/nats-io/nats.go"
	"github.com/nats-io/nats.go/jetstream"
	"github.com/nats-nui/nui/internal/connection"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestValidateListenFilter(t *testing.T) {
	assert.Equal(t, ">", normalizeListenFilter(""))
	assert.Equal(t, ">", normalizeListenFilter("   "))
	assert.NoError(t, validateListenFilter(""))
	assert.NoError(t, validateListenFilter(">"))
	assert.NoError(t, validateListenFilter("*"))
	assert.NoError(t, validateListenFilter("*.>"))
	assert.NoError(t, validateListenFilter("*.*"))
	assert.ErrorIs(t, validateListenFilter("orders.> extra"), errFilterInvalid)
	assert.ErrorIs(t, validateListenFilter("orders..created"), errFilterInvalid)
	assert.ErrorIs(t, validateListenFilter(".orders"), errFilterInvalid)
	assert.ErrorIs(t, validateListenFilter("orders."), errFilterInvalid)
	assert.ErrorIs(t, validateListenFilter("foo>bar"), errFilterInvalid)
	assert.ErrorIs(t, validateListenFilter("a.>.b"), errFilterInvalid)
	assert.NoError(t, validateListenFilter("orders.>"))
	assert.NoError(t, validateListenFilter("orders.created"))
	assert.NoError(t, validateListenFilter("foo.*.bar"))
}

func TestIsInternalSubject(t *testing.T) {
	assert.True(t, isInternalSubject("$SYS.SERVER.INFO"))
	assert.True(t, isInternalSubject("$JS.API.INFO"))
	assert.True(t, isInternalSubject("_INBOX.abc"))
	assert.False(t, isInternalSubject("orders.created"))
	assert.False(t, isInternalSubject("$KV.mybucket.key"))
	assert.False(t, isInternalSubject("$O.files.chunk"))
}

func TestCollapsePattern(t *testing.T) {
	path, kind := collapsePattern("$KV.mybucket.>", kindKV)
	assert.Equal(t, "$KV.mybucket", path)
	assert.Equal(t, kindKV, kind)

	path, kind = collapsePattern("$O.files.C.>", kindObject)
	assert.Equal(t, "$O.files", path)
	assert.Equal(t, kindObject, kind)

	path, kind = collapsePattern("orders.>", kindStream)
	assert.Equal(t, "orders", path)
	assert.Equal(t, kindPattern, kind)
}

func TestCapAppendPerStream(t *testing.T) {
	var got []int
	truncated := false
	for i := 0; i < 8; i++ {
		var capped bool
		got, capped = capAppend(got, i, 3)
		if capped {
			truncated = true
		}
	}
	assert.Equal(t, []int{0, 1, 2}, got)
	assert.True(t, truncated)
}

func TestJsUserError(t *testing.T) {
	assert.Equal(t, "", jsUserError(nil))
	assert.Equal(t, "timed out", jsUserError(context.DeadlineExceeded))
	assert.Equal(t, "not enabled on this server", jsUserError(errors.New("nats: JetStream not enabled")))
	assert.Equal(t, "not allowed", jsUserError(errors.New("nats: permissions violation")))
}

func TestCoreUserError(t *testing.T) {
	assert.Equal(t, "not allowed", coreUserError(errors.New("nats: Permissions Violation for Subscription to \">\"")))
	assert.Equal(t, "timed out", coreUserError(context.Canceled))
}

func TestSampleCoreCancelUnsubscribes(t *testing.T) {
	ns := startTestNATS(t, nil)
	nc, err := nats.Connect(ns.ClientURL())
	require.NoError(t, err)
	defer nc.Close()

	ctx, cancel := context.WithCancel(context.Background())
	done := make(chan *CoreCatalog, 1)
	go func() {
		done <- sampleCore(ctx, nc, "probe.>", 5*time.Second, true)
	}()
	require.Eventually(t, func() bool { return nc.NumSubscriptions() == 1 }, time.Second, 10*time.Millisecond)

	cancel()
	select {
	case out := <-done:
		assert.Empty(t, out.Error)
		assert.Equal(t, 0, out.Heard)
	case <-time.After(500 * time.Millisecond):
		t.Fatal("listen did not return after cancel")
	}
	require.Eventually(t, func() bool { return nc.NumSubscriptions() == 0 }, time.Second, 10*time.Millisecond)
}

func TestSampleCoreHearsLiteralPrefixOnly(t *testing.T) {
	ns := startTestNATS(t, nil)
	nc, err := nats.Connect(ns.ClientURL())
	require.NoError(t, err)
	defer nc.Close()

	go func() {
		for i := 0; i < 40; i++ {
			_ = nc.Publish("orders.created", []byte("x"))
			_ = nc.Publish("other.ignored", []byte("y"))
			time.Sleep(15 * time.Millisecond)
		}
	}()

	out := sampleCore(context.Background(), nc, "orders.>", 400*time.Millisecond, true)
	require.Empty(t, out.Error)
	require.GreaterOrEqual(t, out.Heard, 1)
	assert.GreaterOrEqual(t, out.Dropped, 0)
	for _, s := range out.Subjects {
		assert.Equal(t, "orders.created", s.Subject)
		assert.Greater(t, s.Count, 0)
	}
}

func TestSampleCoreNotAllowed(t *testing.T) {
	acc := server.NewAccount("A")
	opts := &server.Options{
		Host:   "127.0.0.1",
		Port:   -1,
		NoLog:  true,
		NoSigs: true,
		Users: []*server.User{
			{Username: "limited", Password: "limited", Account: acc, Permissions: &server.Permissions{
				Subscribe: &server.SubjectPermission{Allow: []string{"orders.>"}},
			}},
		},
		Accounts: []*server.Account{acc},
	}
	ns := startTestNATS(t, opts)
	nc, err := nats.Connect(ns.ClientURL(), nats.UserInfo("limited", "limited"))
	require.NoError(t, err)
	defer nc.Close()

	out := sampleCore(context.Background(), nc, "secret.>", 200*time.Millisecond, true)
	assert.Equal(t, "not allowed", out.Error)
}

func TestDialOnceIsNotPooled(t *testing.T) {
	ns := startTestNATS(t, nil)
	cfg := &connection.Connection{Name: "demo", Hosts: []string{ns.ClientURL()}}
	a, err := connection.DialOnce(cfg)
	require.NoError(t, err)
	b, err := connection.DialOnce(cfg)
	require.NoError(t, err)
	defer a.Close()
	defer b.Close()
	idA, err := a.GetClientID()
	require.NoError(t, err)
	idB, err := b.GetClientID()
	require.NoError(t, err)
	assert.NotEqual(t, idA, idB)
}

func TestEnumerateJetStreamPatternsNotOccupied(t *testing.T) {
	ns := startTestNATS(t, jsOpts(t))
	nc, err := nats.Connect(ns.ClientURL())
	require.NoError(t, err)
	defer nc.Close()
	js, err := jetstream.New(nc)
	require.NoError(t, err)

	_, err = js.CreateStream(context.Background(), jetstream.StreamConfig{
		Name:     "ORDERS",
		Subjects: []string{"orders.>", "returns.>"},
		Storage:  jetstream.MemoryStorage,
	})
	require.NoError(t, err)
	_, err = js.Publish(context.Background(), "orders.created", []byte("1"))
	require.NoError(t, err)
	_, err = js.Publish(context.Background(), "orders.shipped", []byte("2"))
	require.NoError(t, err)

	cat := enumerateJetStreamPatterns(context.Background(), js, true)
	require.Empty(t, cat.Error)
	require.Len(t, cat.Streams, 1)
	assert.Equal(t, "ORDERS", cat.Streams[0].Name)
	assert.Equal(t, kindStream, cat.Streams[0].Kind)
	got := []string{}
	for _, s := range cat.Streams[0].Subjects {
		got = append(got, s.Subject)
		assert.Equal(t, kindPattern, s.Kind)
		assert.Zero(t, s.Count)
	}
	assert.Equal(t, []string{"orders", "returns"}, got)
}

func TestCatalogFromInfosKeepsPartialOnTimeout(t *testing.T) {
	infos := []*jetstream.StreamInfo{{
		Config: jetstream.StreamConfig{Name: "ORDERS", Subjects: []string{"orders.>"}},
	}}
	cat := catalogFromInfos(infos, context.DeadlineExceeded, true)
	require.Equal(t, "timed out", cat.Error)
	assert.True(t, cat.Truncated)
	require.Len(t, cat.Streams, 1)
	assert.Equal(t, "ORDERS", cat.Streams[0].Name)
	require.Len(t, cat.Streams[0].Subjects, 1)
	assert.Equal(t, "orders", cat.Streams[0].Subjects[0].Subject)

	empty := catalogFromInfos(nil, context.DeadlineExceeded, true)
	assert.Equal(t, "timed out", empty.Error)
	assert.False(t, empty.Truncated)
	assert.Empty(t, empty.Streams)
}

func TestOccupiedCapsPerStream(t *testing.T) {
	ns := startTestNATS(t, jsOpts(t))
	nc, err := nats.Connect(ns.ClientURL())
	require.NoError(t, err)
	defer nc.Close()
	js, err := jetstream.New(nc)
	require.NoError(t, err)
	_, err = js.CreateStream(context.Background(), jetstream.StreamConfig{
		Name:     "MANY",
		Subjects: []string{"n.>"},
		Storage:  jetstream.MemoryStorage,
	})
	require.NoError(t, err)
	for i := 0; i < maxOccupiedPerStream+25; i++ {
		_, err = js.Publish(context.Background(), "n."+itoa(i), []byte("x"))
		require.NoError(t, err)
	}

	out := occupiedSubjects(context.Background(), js, "MANY", "n.>", true)
	require.Empty(t, out.Error)
	assert.True(t, out.Truncated)
	assert.Len(t, out.Subjects, maxOccupiedPerStream)
	for _, s := range out.Subjects {
		assert.Equal(t, kindOccupied, s.Kind)
		assert.Greater(t, s.Count, uint64(0))
	}
}

func TestKVCatalogCollapsesToBucket(t *testing.T) {
	ns := startTestNATS(t, jsOpts(t))
	nc, err := nats.Connect(ns.ClientURL())
	require.NoError(t, err)
	defer nc.Close()
	js, err := jetstream.New(nc)
	require.NoError(t, err)
	kv, err := js.CreateKeyValue(context.Background(), jetstream.KeyValueConfig{Bucket: "shop", Storage: jetstream.MemoryStorage})
	require.NoError(t, err)
	_, err = kv.Put(context.Background(), "a", []byte("1"))
	require.NoError(t, err)
	_, err = kv.Put(context.Background(), "b", []byte("2"))
	require.NoError(t, err)

	cat := enumerateJetStreamPatterns(context.Background(), js, true)
	require.Empty(t, cat.Error)
	require.NotEmpty(t, cat.Streams)
	var kvStream *JetStreamStream
	for i := range cat.Streams {
		if cat.Streams[i].Kind == kindKV {
			kvStream = &cat.Streams[i]
			break
		}
	}
	require.NotNil(t, kvStream)
	require.Len(t, kvStream.Subjects, 1)
	assert.Equal(t, "$KV.shop", kvStream.Subjects[0].Subject)
	assert.Equal(t, kindKV, kvStream.Subjects[0].Kind)
}

func startTestNATS(t *testing.T, opts *server.Options) *server.Server {
	t.Helper()
	if opts == nil {
		opts = &server.Options{Host: "127.0.0.1", Port: -1, NoLog: true, NoSigs: true}
	}
	if opts.Host == "" {
		opts.Host = "127.0.0.1"
	}
	if opts.Port == 0 {
		opts.Port = -1
	}
	ns, err := server.NewServer(opts)
	require.NoError(t, err)
	ns.Start()
	if !ns.ReadyForConnections(5 * time.Second) {
		t.Fatal("nats server not ready")
	}
	t.Cleanup(ns.Shutdown)
	return ns
}

func jsOpts(t *testing.T) *server.Options {
	t.Helper()
	return &server.Options{
		Host:      "127.0.0.1",
		Port:      -1,
		NoLog:     true,
		NoSigs:    true,
		JetStream: true,
		StoreDir:  t.TempDir(),
	}
}

func itoa(n int) string {
	if n == 0 {
		return "0"
	}
	var b [12]byte
	i := len(b)
	for n > 0 {
		i--
		b[i] = byte('0' + n%10)
		n /= 10
	}
	return string(b[i:])
}
