package metrics

import (
	"context"
	"github.com/nats-nui/nui/internal/connection"
	"time"
)

type Repo interface {
	GetById(id string) (*connection.Connection, error)
}

type MetricsCollector interface {
	Start(ctx context.Context, cfg ServiceCfg) (<-chan Metrics, error)
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
	ticker := time.Tick(1 * time.Second)
	go func() {
		for {
			select {
			case <-ctx.Done():
				close(metricsChan)
				return
			case <-ticker:
				metrics := Metrics{RetrievedAt: time.Now()}
				select {
				case metricsChan <- metrics:
				default:
				}
			}
		}
	}()
	return metricsChan, nil
}
