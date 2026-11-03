package metrics

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"time"
)

// Endpoint constants
const (
	keyVarz       = "varz"
	endpointVarz  = "/varz"
	keyConnz      = "connz"
	endpointConnz = "/connz?limit=10000&sort=last&subs=detail"
)

var AllEndpoints = map[string]string{keyVarz: endpointVarz, keyConnz: endpointConnz}

type HTTPSource struct {
	client  *http.Client
	baseURL string
}

func NewHTTPSource(baseURL string) *HTTPSource {
	return &HTTPSource{
		client: &http.Client{
			Timeout: 5 * time.Second,
		},
		baseURL: baseURL,
	}
}

func (s *HTTPSource) FetchMetrics(ctx context.Context) (map[string]map[string]any, error) {
	result := make(map[string]map[string]any)
	var fetchError error

	// fetch data from all endpoints in list
	for key, endpoint := range AllEndpoints {
		data, err := s.fetchEndpoint(ctx, endpoint)
		if err != nil {
			fetchError = errors.Join(fetchError, fmt.Errorf("%s fetch error: %w", key, err))
		} else {
			result[key] = data
		}
	}

	if len(result) == 0 {
		return nil, fetchError
	}

	return result, fetchError
}

func (s *HTTPSource) fetchEndpoint(ctx context.Context, endpoint string) (map[string]interface{}, error) {
	url := fmt.Sprintf("%s%s", s.baseURL, endpoint)

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	resp, err := s.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to execute request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("received non-OK status code: %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	var result map[string]interface{}
	if err := json.Unmarshal(body, &result); err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %w", err)
	}

	return result, nil
}
