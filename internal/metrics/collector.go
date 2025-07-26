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
	repo        Repo
	connBuilder connection.ConnBuilder[*connection.NatsConn]
}

func NewCollector(repo Repo, connBuilder connection.ConnBuilder[*connection.NatsConn]) *Collector {
	return &Collector{
		repo:        repo,
		connBuilder: connBuilder,
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
	source, err := s.buildMetricsSource(conn)
	if err != nil {
		return nil, err
	}

	go func() {
		generalRatesDecorator := NewRatesDecorator(ratesMetrics)
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
					generalRatesDecorator.Decorate(rawNatsMetrics["varz"])
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

func (s *Collector) buildMetricsSource(conn *connection.Connection) (MetricsSource, error) {
	metrics := conn.Metrics
	if metrics.HttpSource.Active {
		return NewHTTPSource(metrics.HttpSource.Url), nil
	}
	if metrics.NatsSource.Active {
		return NewNatsSource(conn, s.connBuilder)
	}
	return nil, errors.New("metrics source not implemented")
}
