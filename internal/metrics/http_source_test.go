package metrics

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestHTTPSource_FetchMetrics(t *testing.T) {
	t.Run("successful fetch of all endpoints", func(t *testing.T) {
		// Setup test server
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			switch r.URL.Path {
			case "/varz":
				json.NewEncoder(w).Encode(map[string]interface{}{
					"server_id":   "NCZORSF4XMZKLFSJTJRJ72Y3LWQPORS2MCK3Q6YLDPWX6ZJHCGDBJQOD",
					"server_name": "NCZORSF4XMZK",
					"version":     "2.9.22",
					"go":          "go1.20.7",
					"host":        "0.0.0.0",
					"port":        4222,
					"mem":         35655680,
					"connections": 3,
				})
			case "/connz":
				json.NewEncoder(w).Encode(map[string]interface{}{
					"server_id":       "NCZORSF4XMZKLFSJTJRJ72Y3LWQPORS2MCK3Q6YLDPWX6ZJHCGDBJQOD",
					"now":             time.Now().Format(time.RFC3339),
					"num_connections": 3,
					"total":           3,
					"connections": []map[string]interface{}{
						{
							"cid":   1,
							"ip":    "127.0.0.1",
							"port":  53424,
							"start": time.Now().Add(-10 * time.Minute).Format(time.RFC3339),
						},
					},
				})
			default:
				w.WriteHeader(http.StatusNotFound)
			}
		}))
		defer server.Close()

		// Create HTTP source with test server URL
		source := NewHTTPSource(server.URL)

		// Execute fetch
		metrics, err := source.FetchMetrics(context.Background())

		// Assertions
		require.NoError(t, err)
		require.NotNil(t, metrics)
		assert.Contains(t, metrics, "varz")
		assert.Contains(t, metrics, "connz")

		varz, ok := metrics["varz"].(map[string]interface{})
		require.True(t, ok)
		assert.Equal(t, "2.9.22", varz["version"])

		connz, ok := metrics["connz"].(map[string]interface{})
		require.True(t, ok)
		assert.Equal(t, float64(3), connz["num_connections"])
	})

	t.Run("partial data with error", func(t *testing.T) {
		// Setup test server with failing connz endpoint
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			switch r.URL.Path {
			case "/varz":
				json.NewEncoder(w).Encode(map[string]interface{}{
					"server_id":   "NCZORSF4XMZK",
					"version":     "2.9.22",
					"connections": 3,
				})
			case "/connz":
				w.WriteHeader(http.StatusInternalServerError)
			default:
				w.WriteHeader(http.StatusNotFound)
			}
		}))
		defer server.Close()

		// Create HTTP source with test server URL
		source := NewHTTPSource(server.URL)

		// Execute fetch
		metrics, err := source.FetchMetrics(context.Background())

		// Assertions
		require.Error(t, err)
		require.NotNil(t, metrics)
		assert.Contains(t, metrics, "varz")
		assert.NotContains(t, metrics, "connz")
		assert.Contains(t, err.Error(), "connz fetch error")
	})

	t.Run("complete failure returns error", func(t *testing.T) {
		// Setup test server with all failing endpoints
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusInternalServerError)
		}))
		defer server.Close()

		// Create HTTP source with test server URL
		source := NewHTTPSource(server.URL)

		// Execute fetch
		metrics, err := source.FetchMetrics(context.Background())

		// Assertions
		require.Error(t, err)
		assert.Nil(t, metrics)
		assert.Contains(t, err.Error(), "varz fetch error")
		assert.Contains(t, err.Error(), "connz fetch error")
	})

	t.Run("invalid JSON response", func(t *testing.T) {
		// Setup test server with invalid JSON
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Write([]byte("not valid json"))
		}))
		defer server.Close()

		// Create HTTP source with test server URL
		source := NewHTTPSource(server.URL)

		// Execute fetch
		metrics, err := source.FetchMetrics(context.Background())

		// Assertions
		require.Error(t, err)
		assert.Nil(t, metrics)
		assert.Contains(t, err.Error(), "failed to unmarshal response")
	})

	t.Run("timeout handling", func(t *testing.T) {
		// Setup test server with delay
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			time.Sleep(200 * time.Millisecond)
			json.NewEncoder(w).Encode(map[string]interface{}{"key": "value"})
		}))
		defer server.Close()

		// Create HTTP source with very short timeout
		source := &HTTPSource{
			client: &http.Client{
				Timeout: 100 * time.Millisecond,
			},
			baseURL: server.URL,
		}

		// Execute fetch
		_, err := source.FetchMetrics(context.Background())

		// Assertions
		require.Error(t, err)
		assert.Contains(t, err.Error(), "context deadline exceeded")
	})
}
