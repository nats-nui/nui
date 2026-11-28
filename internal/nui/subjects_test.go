package nui

import (
	"context"
	"errors"
	"strconv"
	"testing"
	"time"

	"github.com/nats-io/nats-server/v2/server"
	"github.com/nats-io/nats.go"
	"github.com/nats-io/nats.go/jetstream"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestValidateListenFilter(t *testing.T) {
	for _, filter := range []string{">", "*", "*.>", "*.*", "foo>bar", "orders.a*b", "orders.>", "orders.created", "foo.*.bar", "  orders  "} {
		assert.NoError(t, validateListenFilter(filter), filter)
	}
	for _, filter := range []string{"", "   ", "orders.> extra", "orders..created", ".orders", "orders.", "a.>.b"} {
		assert.ErrorIs(t, validateListenFilter(filter), errFilterInvalid, filter)
	}
}

func TestIsInternalSubject(t *testing.T) {
	assert.True(t, isInternalSubject("$SYS.SERVER.INFO"))
	assert.True(t, isInternalSubject("$JS.API.INFO"))
	assert.True(t, isInternalSubject("_INBOX.abc"))
	assert.False(t, isInternalSubject("orders.created"))
	assert.False(t, isInternalSubject("$KV.mybucket.key"))
	assert.False(t, isInternalSubject("$O.files.chunk"))
	assert.False(t, isInternalSubject("$SYSTEM.not-sys"))
}

func TestSubjectDiscoveryError(t *testing.T) {
	assert.Equal(t, "", subjectDiscoveryError(nil))
	assert.Equal(t, "interrupted", subjectDiscoveryError(context.Canceled))
	assert.Equal(t, "subject discovery failed", subjectDiscoveryError(errors.New("private-fixture.creds")))
	assert.Equal(t, "timed out", subjectDiscoveryError(context.DeadlineExceeded))
	assert.Equal(t, "not enabled on this server", subjectDiscoveryError(errors.New("nats: JetStream not enabled")))
	assert.Equal(t, "not allowed", subjectDiscoveryError(errors.New("nats: permissions violation")))
}

type testStreamList struct {
	infos []*jetstream.StreamInfo
	err   error
}

func (l testStreamList) Err() error { return l.err }
func (l testStreamList) Info() <-chan *jetstream.StreamInfo {
	ch := make(chan *jetstream.StreamInfo, len(l.infos))
	for _, info := range l.infos {
		ch <- info
	}
	close(ch)
	return ch
}

func TestCatalogPreservesLiteralAndWildcard(t *testing.T) {
	for _, subjects := range [][]string{{"orders", "orders.>"}, {"orders.>", "orders"}} {
		catalog := catalogFromLister(testStreamList{infos: []*jetstream.StreamInfo{{
			Config: jetstream.StreamConfig{Name: "ORDERS", Subjects: subjects},
		}}}, true)
		require.Len(t, catalog.Streams, 1)
		assert.Equal(t, []JetStreamSubject{
			{Subject: "orders", Pattern: "orders", Kind: kindPattern},
			{Subject: "orders.>", Pattern: "orders.>", Kind: kindPattern},
		}, catalog.Streams[0].Subjects)
	}
}

func TestSampleCoreCancelUnsubscribes(t *testing.T) {
	nc := testNATSConnection(t, nil)

	ctx, cancel := context.WithCancel(context.Background())
	done := make(chan *CoreCatalog, 1)
	go func() {
		done <- sampleCoreLimited(ctx, nc, "probe.>", 5*time.Second, maxCoreSubjects, true)
	}()
	require.Eventually(t, func() bool { return nc.NumSubscriptions() == 1 }, time.Second, 10*time.Millisecond)

	cancel()
	select {
	case out := <-done:
		assert.Equal(t, "interrupted", out.Error)
		assert.Equal(t, 0, out.Heard)
	case <-time.After(500 * time.Millisecond):
		t.Fatal("listen did not return after cancel")
	}
	require.Eventually(t, func() bool { return nc.NumSubscriptions() == 0 }, time.Second, 10*time.Millisecond)
}

func TestSampleCoreSubjects(t *testing.T) {
	nc := testNATSConnection(t, nil)
	orders := CoreSubject{Subject: "orders.created", Count: 2}
	inbox := CoreSubject{Subject: "_INBOX.probe", Count: 1}
	for _, tc := range []struct {
		name, filter string
		discardSys   bool
		want         []CoreSubject
	}{
		{"match filter", "orders.>", false, []CoreSubject{orders}},
		{"hide system subjects", ">", true, []CoreSubject{orders}},
		{"include system subjects", ">", false, []CoreSubject{inbox, orders}},
	} {
		t.Run(tc.name, func(t *testing.T) {
			ctx, cancel := context.WithTimeout(t.Context(), 2*time.Second)
			defer cancel()
			done := make(chan *CoreCatalog, 1)
			go func() {
				done <- sampleCoreLimited(ctx, nc, tc.filter, 200*time.Millisecond, maxCoreSubjects, tc.discardSys)
			}()
			require.Eventually(t, func() bool { return nc.NumSubscriptions() == 1 }, time.Second, time.Millisecond)
			for _, subject := range []string{orders.Subject, inbox.Subject, orders.Subject} {
				require.NoError(t, nc.Publish(subject, nil))
			}
			select {
			case out := <-done:
				require.Empty(t, out.Error)
				assert.Zero(t, out.Dropped)
				assert.Equal(t, len(tc.want), out.Heard)
				assert.Equal(t, tc.want, out.Subjects)
			case <-ctx.Done():
				t.Fatal("sample did not finish")
			}
		})
	}
}

func TestSampleCoreNotAllowed(t *testing.T) {
	acc := server.NewAccount("A")
	opts := &server.Options{
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

	out := sampleCoreLimited(context.Background(), nc, "secret.>", 200*time.Millisecond, maxCoreSubjects, true)
	assert.Equal(t, "not allowed", out.Error)
}

func TestSampleCoreReportsPendingByteLimit(t *testing.T) {
	nc := testNATSConnection(t, nil)
	done := make(chan *CoreCatalog, 1)
	go func() {
		done <- sampleCoreLimited(context.Background(), nc, "large.message", 5*time.Second, maxCoreSubjects, true)
	}()
	require.Eventually(t, func() bool { return nc.NumSubscriptions() == 1 }, time.Second, 10*time.Millisecond)
	require.NoError(t, nc.Publish("large.message", make([]byte, corePendingBytes+1)))
	require.NoError(t, nc.Flush())
	select {
	case sample := <-done:
		require.Equal(t, "too much traffic", sample.Error)
		require.Equal(t, 1, sample.Dropped)
		require.Empty(t, sample.Subjects)
	case <-time.After(time.Second):
		t.Fatal("dropped message left the sampler waiting for delivery")
	}
}

func TestSampleCoreStopsAtCatalogCap(t *testing.T) {
	nc := testNATSConnection(t, nil)

	const nameCap = 8
	done := make(chan *CoreCatalog, 1)
	go func() {
		done <- sampleCoreLimited(context.Background(), nc, "cap.>", 5*time.Second, nameCap, true)
	}()
	require.Eventually(t, func() bool { return nc.NumSubscriptions() == 1 }, time.Second, 10*time.Millisecond)

	start := time.Now()
	for i := 0; i < nameCap+20; i++ {
		require.NoError(t, nc.Publish("cap."+strconv.Itoa(i), []byte("x")))
	}
	require.NoError(t, nc.Flush())

	select {
	case out := <-done:
		require.True(t, out.Truncated, "error=%q heard=%d", out.Error, out.Heard)
		assert.Equal(t, nameCap, out.Heard)
		assert.Less(t, time.Since(start), time.Second)
	case <-time.After(2 * time.Second):
		t.Fatal("time-based listen did not return")
	}
	require.Eventually(t, func() bool { return nc.NumSubscriptions() == 0 }, time.Second, 10*time.Millisecond)
}

func TestCatalogFromInfosDiscardsSystemUnlessAsked(t *testing.T) {
	infos := []*jetstream.StreamInfo{{
		Config: jetstream.StreamConfig{Name: "MIXED", Subjects: []string{"$JS.API.>", "orders.>", "$KV.shop.>"}},
	}}
	hidden := catalogFromLister(testStreamList{infos: infos}, true)
	require.Len(t, hidden.Streams, 1)
	got := []string{}
	for _, s := range hidden.Streams[0].Subjects {
		got = append(got, s.Subject)
	}
	assert.Equal(t, []string{"$KV.shop.>", "orders.>"}, got)

	shown := catalogFromLister(testStreamList{infos: infos}, false)
	got = nil
	for _, s := range shown.Streams[0].Subjects {
		got = append(got, s.Subject)
	}
	assert.Equal(t, []string{"$JS.API.>", "$KV.shop.>", "orders.>"}, got)
}

func TestCatalogFromInfosKeepsPartialOnTimeout(t *testing.T) {
	infos := []*jetstream.StreamInfo{{
		Config: jetstream.StreamConfig{Name: "ORDERS", Subjects: []string{"orders.>"}},
	}}
	cat := catalogFromLister(testStreamList{infos: infos, err: context.DeadlineExceeded}, true)
	require.Equal(t, "timed out", cat.Error)
	assert.True(t, cat.Truncated)
	require.Len(t, cat.Streams, 1)
	assert.Equal(t, "ORDERS", cat.Streams[0].Name)
	require.Len(t, cat.Streams[0].Subjects, 1)
	assert.Equal(t, "orders.>", cat.Streams[0].Subjects[0].Subject)

	empty := catalogFromLister(testStreamList{err: context.DeadlineExceeded}, true)
	assert.Equal(t, "timed out", empty.Error)
	assert.False(t, empty.Truncated)
	assert.Empty(t, empty.Streams)
}

func TestOccupiedCapsPerStream(t *testing.T) {
	nc := testNATSConnection(t, jsOpts(t))
	js, err := jetstream.New(nc)
	require.NoError(t, err)
	_, err = js.CreateStream(context.Background(), jetstream.StreamConfig{
		Name:     "MANY",
		Subjects: []string{"n.>"},
		Storage:  jetstream.MemoryStorage,
	})
	require.NoError(t, err)
	for i := 0; i < maxOccupiedPerStream+25; i++ {
		_, err = js.Publish(context.Background(), "n."+strconv.Itoa(i), []byte("x"))
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

func testNATSConnection(t *testing.T, opts *server.Options) *nats.Conn {
	t.Helper()
	ns := startTestNATS(t, opts)
	nc, err := nats.Connect(ns.ClientURL())
	require.NoError(t, err)
	t.Cleanup(nc.Close)
	return nc
}

func startTestNATS(t *testing.T, opts *server.Options) *server.Server {
	t.Helper()
	if opts == nil {
		opts = &server.Options{}
	}
	opts.Host, opts.Port = "127.0.0.1", -1
	opts.NoLog, opts.NoSigs = true, true
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
	return &server.Options{JetStream: true, StoreDir: t.TempDir()}
}
