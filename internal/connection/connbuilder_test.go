package connection

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestNatsConnectTimeoutCoversPublicHosts(t *testing.T) {
	// nats.go defaults to 2s. demo.nats.io is often just over that.
	assert.Greater(t, natsConnectTimeout, 2*time.Second)
	assert.GreaterOrEqual(t, natsConnectTimeout, 10*time.Second)
}
