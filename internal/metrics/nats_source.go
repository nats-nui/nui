package metrics

import (
	"context"
	"encoding/json"
	"github.com/nats-io/nats.go"
	"github.com/nats-nui/nui/internal/connection"
	"github.com/synadia-io/orbit.go/natssysclient"
	"time"
)

type NatsSource struct {
	conn     connection.Conn
	natsConn *nats.Conn
	sys      *natssysclient.System
}

func NewNatsSource(conn connection.Conn) *NatsSource {
	natsConn, _ := nats.Connect("nats://localhost:4222")
	sys, _ := natssysclient.NewSysClient(natsConn)
	return &NatsSource{
		conn:     conn,
		natsConn: natsConn,
		sys:      sys,
	}
}

func NewWithNatsConnection(natsConn *nats.Conn) *NatsSource {
	sys, _ := natssysclient.NewSysClient(natsConn)
	return &NatsSource{
		conn:     nil,
		natsConn: natsConn,
		sys:      sys,
	}
}

func (n NatsSource) FetchMetrics(ctx context.Context) (map[string]map[string]any, error) {
	metrics := make(map[string]map[string]any)
	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	varz, err := n.sys.Varz(ctx, n.natsConn.ConnectedServerId(), natssysclient.VarzEventOptions{})
	if err != nil {
		return metrics, err
	}

	metrics["varz"] = encodeToMap(varz.Varz)
	options := natssysclient.ConnzEventOptions{ConnzOptions: natssysclient.ConnzOptions{Limit: 10000, Sort: natssysclient.ByLast}}
	connz, err := n.sys.Connz(ctx, n.natsConn.ConnectedServerId(), options)
	if err != nil {
		return metrics, err
	}
	metrics["connz"] = encodeToMap(connz.Connz)
	return metrics, nil
}

func encodeToMap(data any) map[string]any {
	result := make(map[string]any)
	jsonData, err := json.Marshal(data)
	if err != nil {
		return result
	}
	err = json.Unmarshal(jsonData, &result)
	return result
}
