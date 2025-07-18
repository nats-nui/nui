package metrics

import (
	"context"
	"errors"
	"github.com/nats-nui/nui/internal/connection"
	"time"
)

var ratesMetrics = []string{"in_msgs", "out_msgs", "in_bytes", "out_bytes"}

type Repo interface {
	GetById(id string) (*connection.Connection, error)
}

type MetricsCollector interface {
	Start(ctx context.Context, cfg ServiceCfg) (<-chan Metrics, error)
}

type MetricsSource interface {
	FetchMetrics(ctx context.Context) (map[string]map[string]any, error)
}

type MetricsDecorator interface {
	Decorate(metrics map[string]any) (map[string]any, error)
}

type Collector struct {
	repo Repo
}

func NewCollector(repo Repo) *Collector {
	return &Collector{
		repo: repo,
	}
}

func (s *Collector) Start(ctx context.Context, cfg ServiceCfg) (<-chan Metrics, error) {
	metricsChan := make(chan Metrics, 10)
	pollingInterval := time.Duration(cfg.PollingIntervalMs) * time.Millisecond
	if pollingInterval <= 0 {
		pollingInterval = 1 * time.Second
	}
	ticker := time.Tick(pollingInterval)
	conn, err := s.repo.GetById(cfg.ConnectionId)
	if err != nil {
		return nil, err
	}
	source, err := buildMetricsSource(conn.Metrics)
	if err != nil {
		return nil, err
	}

	go func() {
		generalRatesDecorater := NewRatesDecorator(ratesMetrics)
		connzDecorators := make(map[int]MetricsDecorator)
		for {
			select {
			case <-ctx.Done():
				close(metricsChan)
				return
			case <-ticker:
				rawNatsMetrics, err := source.FetchMetrics(ctx)
				metrics := Metrics{
					RetrievedAt: time.Now(),
					Nats:        rawNatsMetrics,
					Error:       err,
				}
				if err == nil {
					generalRatesDecorater.Decorate(rawNatsMetrics["varz"])
					for _, connMetrics := range rawNatsMetrics["connz"]["connections"].([]any) {
						c := connMetrics.(map[string]any)
						c["now"] = rawNatsMetrics["varz"]["now"]
						cid, ok := c["cid"].(float64)
						if !ok {
							continue
						}
						intCid := int(cid)
						if _, ok := connzDecorators[intCid]; !ok {
							connzDecorators[intCid] = NewRatesDecorator(ratesMetrics)
						}
						connzDecorators[intCid].Decorate(c)
					}
				}
				select {
				case metricsChan <- metrics:
				default:
				}
			}
		}
	}()
	return metricsChan, nil
}

func (s *Collector) collectAndRelay(ctx context.Context, source MetricsSource, metricsChan chan Metrics) {
	rawNatsMetrics, err := source.FetchMetrics(ctx)
	metrics := Metrics{
		RetrievedAt: time.Now(),
		Nats:        rawNatsMetrics,
		Error:       err,
	}
	select {
	case <-ctx.Done():
		return
	case metricsChan <- metrics:
	default:
	}
}

func buildMetricsSource(metrics connection.Metrics) (MetricsSource, error) {
	if metrics.HttpSource.Active {
		return NewHTTPSource(metrics.HttpSource.Url), nil
	}
	return nil, errors.New("metrics source not implemented")
}

func decorateMetrics(metrics map[string]any, decorator MetricsDecorator) (map[string]any, error) {
	if decorator == nil {
		return metrics, nil
	}
	decoratedMetrics, err := decorator.Decorate(metrics["varz"].(map[string]any))
	if err != nil {
		return nil, err
	}
	return decoratedMetrics, nil
}
