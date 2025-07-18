package metrics

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

var testRatesMetrics = []string{"in_msgs", "out_msgs", "in_bytes", "out_bytes", "in_errors", "out_errors"}

func TestRatesDecorator_FirstCall(t *testing.T) {
	decorator := NewRatesDecorator(testRatesMetrics)

	metrics := map[string]any{
		"now":       time.Now().Format(time.RFC3339Nano),
		"in_msgs":   int64(100),
		"out_msgs":  int64(50),
		"in_bytes":  int64(1000),
		"out_bytes": int64(500),
	}

	result, err := decorator.Decorate(metrics)
	require.NoError(t, err)

	// First call should return original metrics (no rates calculated)
	assert.Equal(t, int64(100), result["in_msgs"])
	assert.Equal(t, int64(50), result["out_msgs"])
	assert.Equal(t, int64(1000), result["in_bytes"])
	assert.Equal(t, int64(500), result["out_bytes"])
	// Rate metrics should be nil on first call
	assert.Nil(t, result["nui_in_msgs_sec"])
	assert.Nil(t, result["nui_out_msgs_sec"])
}

func TestRatesDecorator_NormalRate(t *testing.T) {
	decorator := NewRatesDecorator(testRatesMetrics)

	// First call
	now1 := time.Now()
	metrics1 := map[string]any{
		"now":       now1.Format(time.RFC3339Nano),
		"in_msgs":   int64(100),
		"out_msgs":  int64(50),
		"in_bytes":  int64(1000),
		"out_bytes": int64(500),
	}

	_, err := decorator.Decorate(metrics1)
	require.NoError(t, err)

	// Second call after 1 second
	now2 := now1.Add(1 * time.Second)
	metrics2 := map[string]any{
		"now":       now2.Format(time.RFC3339Nano),
		"in_msgs":   int64(150),  // +50 msgs in 1 second = 50 msg/sec
		"out_msgs":  int64(80),   // +30 msgs in 1 second = 30 msg/sec
		"in_bytes":  int64(1500), // +500 bytes in 1 second = 500 bytes/sec
		"out_bytes": int64(800),  // +300 bytes in 1 second = 300 bytes/sec
	}

	result, err := decorator.Decorate(metrics2)
	require.NoError(t, err)

	assert.Equal(t, float64(50), result["nui_in_msgs_sec"], "in_msgs rate should be 50 msg/sec")
	assert.Equal(t, float64(30), result["nui_out_msgs_sec"], "out_msgs rate should be 30 msg/sec")
	assert.Equal(t, float64(500), result["nui_in_bytes_sec"], "in_bytes rate should be 500 bytes/sec")
	assert.Equal(t, float64(300), result["nui_out_bytes_sec"], "out_bytes rate should be 300 bytes/sec")
}

func TestRatesDecorator_TooLongInterval(t *testing.T) {
	decorator := NewRatesDecorator(testRatesMetrics)

	// First call
	now1 := time.Now()
	metrics1 := map[string]any{
		"now":      now1.Format(time.RFC3339Nano),
		"in_msgs":  int64(100),
		"out_msgs": int64(50),
	}

	_, err := decorator.Decorate(metrics1)
	require.NoError(t, err)

	// Second call after more than 2 seconds (should reset)
	now2 := now1.Add(3 * time.Second)
	metrics2 := map[string]any{
		"now":      now2.Format(time.RFC3339Nano),
		"in_msgs":  int64(150),
		"out_msgs": int64(80),
	}

	result, err := decorator.Decorate(metrics2)
	require.NoError(t, err)

	// Should return original values (no rate calculation for long intervals)
	assert.Equal(t, int64(150), result["in_msgs"], "Should return original value for long intervals")
	assert.Equal(t, int64(80), result["out_msgs"], "Should return original value for long intervals")
	// Rate metrics should be nil for long intervals
	assert.Nil(t, result["nui_in_msgs_sec"])
	assert.Nil(t, result["nui_out_msgs_sec"])
}

func TestRatesDecorator_MissingMetrics(t *testing.T) {
	decorator := NewRatesDecorator(testRatesMetrics)

	// First call with some metrics
	now1 := time.Now()
	metrics1 := map[string]any{
		"now":      now1.Format(time.RFC3339Nano),
		"in_msgs":  int64(100),
		"out_msgs": int64(50),
	}

	_, err := decorator.Decorate(metrics1)
	require.NoError(t, err)

	// Second call with different metrics (missing some from first call)
	now2 := now1.Add(1 * time.Second)
	metrics2 := map[string]any{
		"now":      now2.Format(time.RFC3339Nano),
		"in_msgs":  int64(150),
		"in_bytes": int64(1000), // New metric not in first call
		// out_msgs missing
	}

	result, err := decorator.Decorate(metrics2)
	require.NoError(t, err)

	// Should calculate rate for in_msgs
	assert.Equal(t, float64(50), result["nui_in_msgs_sec"], "Should calculate rate for existing metric")

	// Should keep original value for new metric
	assert.Equal(t, int64(1000), result["in_bytes"], "Should keep original value for new metric")

	// Missing metric should not be in result
	assert.NotContains(t, result, "out_msgs")
	assert.Nil(t, result["nui_out_msgs_sec"])
}

func TestRatesDecorator_HighFrequency(t *testing.T) {
	decorator := NewRatesDecorator(testRatesMetrics)

	// First call
	now1 := time.Now()
	metrics1 := map[string]any{
		"now":      now1.Format(time.RFC3339Nano),
		"in_msgs":  int64(1000),
		"out_msgs": int64(500),
	}

	_, err := decorator.Decorate(metrics1)
	require.NoError(t, err)

	// Second call after 100ms (high frequency)
	now2 := now1.Add(100 * time.Millisecond)
	metrics2 := map[string]any{
		"now":      now2.Format(time.RFC3339Nano),
		"in_msgs":  int64(1010), // +10 msgs in 0.1 sec = 100 msg/sec
		"out_msgs": int64(505),  // +5 msgs in 0.1 sec = 50 msg/sec
	}

	result, err := decorator.Decorate(metrics2)
	require.NoError(t, err)

	assert.Equal(t, float64(100), result["nui_in_msgs_sec"], "High frequency rate calculation should work")
	assert.Equal(t, float64(50), result["nui_out_msgs_sec"], "High frequency rate calculation should work")
}

func TestRatesDecorator_DecreasingValues(t *testing.T) {
	decorator := NewRatesDecorator(testRatesMetrics)

	// First call
	now1 := time.Now()
	metrics1 := map[string]any{
		"now":      now1.Format(time.RFC3339Nano),
		"in_msgs":  int64(1000),
		"out_msgs": int64(500),
	}

	_, err := decorator.Decorate(metrics1)
	require.NoError(t, err)

	// Second call with lower values (counter reset scenario)
	now2 := now1.Add(1 * time.Second)
	metrics2 := map[string]any{
		"now":      now2.Format(time.RFC3339Nano),
		"in_msgs":  int64(50), // Lower than previous
		"out_msgs": int64(25), // Lower than previous
	}

	result, err := decorator.Decorate(metrics2)
	require.NoError(t, err)

	// Should handle negative rates as 0
	assert.Equal(t, float64(0), result["nui_in_msgs_sec"], "Should handle counter reset with 0")
	assert.Equal(t, float64(0), result["nui_out_msgs_sec"], "Should handle counter reset with 0")
}

func TestRatesDecorator_InvalidTimeFormat(t *testing.T) {
	decorator := NewRatesDecorator(testRatesMetrics)

	metrics := map[string]any{
		"now":      "invalid-time-format",
		"in_msgs":  int64(100),
		"out_msgs": int64(50),
	}

	_, err := decorator.Decorate(metrics)
	assert.Error(t, err, "Should return error for invalid time format")
}

func TestRatesDecorator_AllRateMetrics(t *testing.T) {
	decorator := NewRatesDecorator(testRatesMetrics)

	// First call with all rate metrics
	now1 := time.Now()
	metrics1 := map[string]any{
		"now":        now1.Format(time.RFC3339Nano),
		"in_msgs":    int64(100),
		"out_msgs":   int64(50),
		"in_bytes":   int64(1000),
		"out_bytes":  int64(500),
		"in_errors":  int64(5),
		"out_errors": int64(2),
	}

	_, err := decorator.Decorate(metrics1)
	require.NoError(t, err)

	// Second call after 2 seconds
	now2 := now1.Add(2 * time.Second)
	metrics2 := map[string]any{
		"now":        now2.Format(time.RFC3339Nano),
		"in_msgs":    int64(200),  // +100 in 2s = 50/s
		"out_msgs":   int64(110),  // +60 in 2s = 30/s
		"in_bytes":   int64(3000), // +2000 in 2s = 1000/s
		"out_bytes":  int64(1500), // +1000 in 2s = 500/s
		"in_errors":  int64(15),   // +10 in 2s = 5/s
		"out_errors": int64(8),    // +6 in 2s = 3/s
	}

	result, err := decorator.Decorate(metrics2)
	require.NoError(t, err)

	expectedRates := map[string]float64{
		"nui_in_msgs_sec":    50,
		"nui_out_msgs_sec":   30,
		"nui_in_bytes_sec":   1000,
		"nui_out_bytes_sec":  500,
		"nui_in_errors_sec":  5,
		"nui_out_errors_sec": 3,
	}

	for metric, expectedRate := range expectedRates {
		assert.Equal(t, expectedRate, result[metric], "Rate for %s should be %d", metric, expectedRate)
	}
}

func TestRatesDecorator_ZeroCurrentValue(t *testing.T) {
	decorator := NewRatesDecorator(testRatesMetrics)

	// First call with non-zero values
	now1 := time.Now()
	metrics1 := map[string]any{
		"now":      now1.Format(time.RFC3339Nano),
		"in_msgs":  int64(100),
		"out_msgs": int64(50),
	}

	_, err := decorator.Decorate(metrics1)
	require.NoError(t, err)

	// Second call with zero current values
	now2 := now1.Add(1 * time.Second)
	metrics2 := map[string]any{
		"now":      now2.Format(time.RFC3339Nano),
		"in_msgs":  int64(0), // Current value is 0
		"out_msgs": int64(0), // Current value is 0
	}

	result, err := decorator.Decorate(metrics2)
	require.NoError(t, err)

	// Should return 0 when current value is 0
	assert.Equal(t, float64(0), result["nui_in_msgs_sec"], "Should return 0 rate when current value is 0")
	assert.Equal(t, float64(0), result["nui_out_msgs_sec"], "Should return 0 rate when current value is 0")
}

func TestRatesDecorator_SubSecondInterval(t *testing.T) {
	decorator := NewRatesDecorator(testRatesMetrics)

	// First call
	now1 := time.Now()
	metrics1 := map[string]any{
		"now":      now1.Format(time.RFC3339Nano),
		"in_msgs":  int64(100),
		"out_msgs": int64(50),
	}

	_, err := decorator.Decorate(metrics1)
	require.NoError(t, err)

	// Second call after 500ms
	now2 := now1.Add(500 * time.Millisecond)
	metrics2 := map[string]any{
		"now":      now2.Format(time.RFC3339Nano),
		"in_msgs":  int64(125), // +25 msgs in 0.5 sec = 50 msg/sec
		"out_msgs": int64(60),  // +10 msgs in 0.5 sec = 20 msg/sec
	}

	result, err := decorator.Decorate(metrics2)
	require.NoError(t, err)

	assert.Equal(t, float64(50), result["nui_in_msgs_sec"], "Sub-second interval rate calculation should work")
	assert.Equal(t, float64(20), result["nui_out_msgs_sec"], "Sub-second interval rate calculation should work")
}
