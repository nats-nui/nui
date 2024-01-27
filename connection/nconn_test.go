package connection

import (
	"context"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"testing"
	"time"
)

func TestNatsConn_ObserveConnectionEvents(t *testing.T) {
	nconn, _ := newMocked()
	events1 := []string{}
	events2 := []string{}
	ch1 := nconn.ObserveConnectionEvents(context.Background())
	ctx2, cancel := context.WithCancel(context.Background())
	ch2 := nconn.ObserveConnectionEvents(ctx2)

	go func() {
		for e := range ch1 {
			events1 = append(events1, e.Status)
		}
	}()

	go func() {
		for e := range ch2 {
			events2 = append(events2, e.Status)
		}
	}()

	nconn.DisconnectErrHandler()(nconn.Conn, nil)
	nconn.ReconnectHandler()(nconn.Conn)

	cancel()
	time.Sleep(1 * time.Second)
	nconn.ReconnectHandler()(nconn.Conn)

	nconn.ClosedHandler()(nconn.Conn)
	nconn.Close()

	nconn.ReconnectHandler()(nconn.Conn)

	require.EventuallyWithT(t, func(c *assert.CollectT) {
		assert.Equal(t, []string{"disconnected", "connected", "connected", "disconnected"}, events1)
		assert.Equal(t, []string{"disconnected", "connected"}, events2)
	}, 1*time.Second, time.Millisecond*20)

}
