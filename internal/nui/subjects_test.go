package nui

import (
	"context"
	"errors"
	"strings"
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
	assert.Equal(t, "", normalizeListenFilter(""))
	assert.Equal(t, "", normalizeListenFilter("   "))
	assert.ErrorIs(t, validateListenFilter(""), errFilterInvalid)
	assert.ErrorIs(t, validateListenFilter("   "), errFilterInvalid)
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
	assert.False(t, isInternalSubject("$SYSTEM.not-sys"))
	assert.True(t, hideInternal(true, "$SYS.SERVER.INFO"))
	assert.False(t, hideInternal(false, "$SYS.SERVER.INFO"))
	assert.False(t, hideInternal(true, "$KV.shop.key"))
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
		done <- sampleCore(ctx, nc, "probe.>", 5*time.Second)
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

	out := sampleCore(context.Background(), nc, "orders.>", 400*time.Millisecond)
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

	out := sampleCore(context.Background(), nc, "secret.>", 200*time.Millisecond)
	assert.Equal(t, "not allowed", out.Error)
}

func TestSampleCoreCapsCatalogForTheTimeWindow(t *testing.T) {
	ns := startTestNATS(t, nil)
	nc, err := nats.Connect(ns.ClientURL())
	require.NoError(t, err)
	defer nc.Close()

	const nameCap = 8
	done := make(chan *CoreCatalog, 1)
	go func() {
		done <- sampleCoreLimited(context.Background(), nc, "cap.>", 300*time.Millisecond, nameCap, true)
	}()
	require.Eventually(t, func() bool { return nc.NumSubscriptions() == 1 }, time.Second, 10*time.Millisecond)

	start := time.Now()
	for i := 0; i < nameCap+20; i++ {
		require.NoError(t, nc.Publish("cap."+itoa(i), []byte("x")))
	}
	require.NoError(t, nc.Flush())

	select {
	case out := <-done:
		require.True(t, out.Truncated, "error=%q heard=%d", out.Error, out.Heard)
		assert.Equal(t, nameCap, out.Heard)
		assert.GreaterOrEqual(t, time.Since(start), 250*time.Millisecond)
	case <-time.After(2 * time.Second):
		t.Fatal("time-based listen did not return")
	}
	require.Eventually(t, func() bool { return nc.NumSubscriptions() == 0 }, time.Second, 10*time.Millisecond)
}

func TestCoreListenGateTakeoverCancelsPrevious(t *testing.T) {
	g := newCoreListenGate()
	ctx1, release1 := g.takeover("c1", context.Background())
	ctx2, release2 := g.takeover("c1", context.Background())
	defer release2()
	<-ctx1.Done()
	release1()
	require.NoError(t, ctx2.Err())
}

func TestCoreWatchReusesOneSubscribe(t *testing.T) {
	ns := startTestNATS(t, nil)
	cfg := &connection.Connection{Name: "watch", Hosts: []string{ns.ClientURL()}}
	pub, err := nats.Connect(ns.ClientURL())
	require.NoError(t, err)
	defer pub.Close()

	h := newCoreWatchHub()
	defer h.stop("id")

	first := h.snapshot("id", "w.>", cfg, true)
	require.Empty(t, first.Error)
	require.True(t, first.Watching)
	require.True(t, h.watching("id"))

	require.NoError(t, pub.Publish("w.one", []byte("x")))
	require.NoError(t, pub.Publish("$SYS.ignore", []byte("x")))
	require.NoError(t, pub.Flush())
	require.Eventually(t, func() bool {
		return h.read("id").Heard >= 1
	}, time.Second, 20*time.Millisecond)

	got := h.snapshot("id", "w.>", cfg, true)
	require.True(t, got.Watching)
	assert.GreaterOrEqual(t, got.Heard, 1)
	for _, s := range got.Subjects {
		assert.False(t, strings.HasPrefix(s.Subject, "$SYS"))
	}

	h.stop("id")
	assert.False(t, h.watching("id"))
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

func TestCatalogFromInfosDiscardsSystemUnlessAsked(t *testing.T) {
	infos := []*jetstream.StreamInfo{{
		Config: jetstream.StreamConfig{Name: "MIXED", Subjects: []string{"$JS.API.>", "orders.>", "$KV.shop.>"}},
	}}
	hidden := catalogFromInfos(infos, nil, true)
	require.Len(t, hidden.Streams, 1)
	got := []string{}
	for _, s := range hidden.Streams[0].Subjects {
		got = append(got, s.Subject)
	}
	assert.Equal(t, []string{"$KV.shop", "orders"}, got)

	shown := catalogFromInfos(infos, nil, false)
	got = nil
	for _, s := range shown.Streams[0].Subjects {
		got = append(got, s.Subject)
	}
	assert.Equal(t, []string{"$JS.API", "$KV.shop", "orders"}, got)
}

func TestSampleCoreKeepsInternalWhenDiscardOff(t *testing.T) {
	ns := startTestNATS(t, nil)
	nc, err := nats.Connect(ns.ClientURL())
	require.NoError(t, err)
	defer nc.Close()

	go func() {
		for i := 0; i < 20; i++ {
			_ = nc.Publish("_INBOX.probe", []byte("x"))
			_ = nc.Publish("orders.created", []byte("y"))
			time.Sleep(15 * time.Millisecond)
		}
	}()

	hidden := sampleCoreLimited(context.Background(), nc, ">", 350*time.Millisecond, maxCoreSubjects, true)
	require.Empty(t, hidden.Error)
	for _, s := range hidden.Subjects {
		assert.False(t, isInternalSubject(s.Subject))
	}

	shown := sampleCoreLimited(context.Background(), nc, ">", 350*time.Millisecond, maxCoreSubjects, false)
	require.Empty(t, shown.Error)
	var sawInbox bool
	for _, s := range shown.Subjects {
		if s.Subject == "_INBOX.probe" {
			sawInbox = true
		}
	}
	assert.True(t, sawInbox)
}

func TestCoreWatchKeepsInternalWhenDiscardOff(t *testing.T) {
	ns := startTestNATS(t, nil)
	cfg := &connection.Connection{Name: "watch-sys", Hosts: []string{ns.ClientURL()}}
	pub, err := nats.Connect(ns.ClientURL())
	require.NoError(t, err)
	defer pub.Close()

	h := newCoreWatchHub()
	defer h.stop("id")

	hidden := h.snapshot("id", ">", cfg, true)
	require.Empty(t, hidden.Error)
	require.True(t, hidden.Watching)
	require.NoError(t, pub.Publish("_INBOX.keep", []byte("x")))
	require.NoError(t, pub.Publish("orders.one", []byte("x")))
	require.NoError(t, pub.Flush())
	require.Eventually(t, func() bool {
		return h.read("id").Heard >= 1
	}, time.Second, 20*time.Millisecond)
	for _, s := range h.read("id").Subjects {
		assert.False(t, isInternalSubject(s.Subject))
	}

	shown := h.snapshot("id", ">", cfg, false)
	require.True(t, shown.Watching)
	require.NoError(t, pub.Publish("_INBOX.keep", []byte("x")))
	require.NoError(t, pub.Flush())
	require.Eventually(t, func() bool {
		out := h.read("id")
		for _, s := range out.Subjects {
			if s.Subject == "_INBOX.keep" {
				return true
			}
		}
		return false
	}, time.Second, 20*time.Millisecond)
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
	for i, s := range out.Subjects {
		assert.Equal(t, kindOccupied, s.Kind)
		assert.Greater(t, s.Count, uint64(0))
		if i > 0 {
			assert.Less(t, out.Subjects[i-1].Subject, s.Subject)
		}
	}
	assert.Equal(t, "n.0", out.Subjects[0].Subject)
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
