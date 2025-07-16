package metrics

import (
	"time"
)

type RatesDecorator struct {
	ratesMetricsKeys []string
	lastMetrics      map[string]any
	lastTime         time.Time
}

func NewRatesDecorator(ratesMetricsKeys []string) *RatesDecorator {
	return &RatesDecorator{
		lastMetrics:      make(map[string]any),
		ratesMetricsKeys: ratesMetricsKeys,
	}
}

func (d *RatesDecorator) Decorate(metrics map[string]any) (map[string]any, error) {
	currentTime, err := time.Parse(time.RFC3339Nano, metrics["now"].(string))
	for _, label := range d.ratesMetricsKeys {
		metrics[rateName(label)] = nil
	}
	if err != nil {
		return nil, err
	}
	timeDiff := currentTime.Sub(d.lastTime)
	if timeDiff <= 2*time.Second {
		for _, label := range d.ratesMetricsKeys {
			lastMetric, lastExists := d.lastMetrics[label]
			currentMetric, currentExists := metrics[label]

			if !lastExists || !currentExists {
				continue
			}

			rate := CalculateRate(lastMetric, currentMetric, timeDiff)
			metrics[rateName(label)] = rate
		}
	}
	d.lastTime = currentTime
	d.updateLastMetrics(metrics)
	return metrics, nil
}

func (d *RatesDecorator) updateLastMetrics(metrics map[string]any) {
	d.lastMetrics = make(map[string]any, len(metrics))
	for _, k := range d.ratesMetricsKeys {
		d.lastMetrics[k] = metrics[k]
	}
}

func CalculateRate(lastMetric, currentMetric any, timeDiff time.Duration) float64 {

	sourceValues := []any{lastMetric, currentMetric}
	convertedValues := []float64{0, 0}
	for i := range sourceValues {
		switch v := sourceValues[i].(type) {
		case int64:
			convertedValues[i] = float64(v)
		case float64:
			convertedValues[i] = v
		default:
			return 0.0
		}
	}

	if convertedValues[0] > convertedValues[1] || timeDiff <= 0 {
		return 0.0
	}
	return float64(convertedValues[1]-convertedValues[0]) / timeDiff.Seconds()
}

func rateName(metric string) string {
	return "nui_" + metric + "_sec"
}
