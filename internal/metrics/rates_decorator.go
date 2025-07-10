package metrics

import (
	"github.com/ostafen/clover/v2/util"
	"time"
)

var ratesMetrics = []string{"in_msgs", "out_msgs", "in_bytes", "out_bytes", "in_errors", "out_errors"}

type RatesDecorator struct {
	lastMetrics map[string]any
	lastTime    time.Time
}

func NewRatesDecorator() *RatesDecorator {
	return &RatesDecorator{
		lastMetrics: make(map[string]any),
	}
}

func (d *RatesDecorator) Decorate(metrics map[string]any) (map[string]any, error) {
	currentTime, err := time.Parse(time.RFC3339, metrics["now"].(string))
	if err != nil {
		return nil, err
	}
	timeDiff := currentTime.Sub(d.lastTime)
	if timeDiff < 2*time.Second {
		for _, label := range ratesMetrics {
			lastMetric, lastExists := d.lastMetrics[label]
			currentMetric, currentExists := metrics[label]

			if !lastExists || !currentExists {
				continue
			}

			rate := calculateRate(lastMetric, currentMetric, timeDiff)
			metrics[label] = rate
		}
	}
	d.lastTime = currentTime
	d.lastMetrics = util.CopyMap(metrics)
	return metrics, nil
}

func calculateRate(lastMetric, currentMetric any, timeDiff time.Duration) int64 {
	lastValue := lastMetric.(int64)
	currentValue := currentMetric.(int64)
	if lastValue == 0 || currentValue == 0 {
		return 0
	}
	rate := float64(currentValue-lastValue) / timeDiff.Seconds()
	return int64(rate)
}

func rateName(metric string) string {
	return metric + "nui_" + metric + "_sec"
}
