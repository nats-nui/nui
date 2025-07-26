package metrics

import (
	"context"
	"fmt"
	"github.com/nats-nui/nui/pkg/testserver"
	"testing"
	"time"

	"github.com/nats-io/nats.go"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestNatsSource_FetchMetrics_WithRealServer(t *testing.T) {

	// Start a real NATS server with system account
	ns, teardown, err := testserver.Build(testserver.WithSysAccount("admin")).Run()
	defer teardown()

	// Connect to the server
	nc, err := nats.Connect(ns.ClientURL(), nats.UserInfo("admin", "admin"))
	require.NoError(t, err)
	defer nc.Close()

	// Create NatsSource
	source := NewWithNatsConnection(nc)

	// Test fetching metrics
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	metrics, err := source.FetchMetrics(ctx)
	require.NoError(t, err)

	// Verify varz metrics
	assert.Contains(t, metrics, "varz")
	varz := metrics["varz"]
	assert.NotEmpty(t, varz)

	// Check for expected varz fields
	assert.Contains(t, varz, "server_id")

	// Verify connz metrics
	assert.Contains(t, metrics, "connz")
	connz := metrics["connz"]
	assert.NotEmpty(t, connz)

	// Check for expected connz fields
	assert.Contains(t, connz, "num_connections")
	assert.Contains(t, connz, "total")
	assert.Contains(t, connz, "connections")
}

func TestNatsSource_FetchMetrics_WithConnections(t *testing.T) {

	// Start a real NATS server with system account
	ns, teardown, err := testserver.Build(testserver.WithSysAccount("admin")).Run()
	defer teardown()

	// Connect system client
	sysNC, err := nats.Connect(ns.ClientURL(), nats.UserInfo("admin", "admin"))
	require.NoError(t, err)
	defer sysNC.Close()

	// Create additional client connections to show up in connz
	var clientConns []*nats.Conn
	for i := 0; i < 3; i++ {
		conn, err := nats.Connect(ns.ClientURL(), nats.Name(fmt.Sprintf("test-client-%d", i)))
		require.NoError(t, err)
		clientConns = append(clientConns, conn)
	}
	defer func() {
		for _, conn := range clientConns {
			conn.Close()
		}
	}()

	// Give connections time to establish
	time.Sleep(100 * time.Millisecond)

	// Create NatsSource and fetch metrics
	source := NewWithNatsConnection(sysNC)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	metrics, err := source.FetchMetrics(ctx)
	require.NoError(t, err)

	// Verify connz shows multiple connections
	connz := metrics["connz"]
	numConnections, ok := connz["num_connections"]
	require.True(t, ok)

	// Should have system connection + client connections
	assert.GreaterOrEqual(t, int(numConnections.(float64)), 3)

	// Verify connections array exists and has data
	connections, ok := connz["connections"]
	assert.True(t, ok)
	connectionsSlice, ok := connections.([]interface{})
	assert.True(t, ok)
	assert.NotEmpty(t, connectionsSlice)
}
