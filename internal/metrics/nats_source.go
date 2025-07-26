package metrics

import (
	"context"
	"encoding/json"
	"github.com/nats-io/nats.go"
	"github.com/synadia-io/orbit.go/natssysclient"
	"time"
)

type NatsSource struct {
	conn *nats.Conn
	sys  *natssysclient.System
}

func NewNatsSource() *NatsSource {
	conn, _ := nats.Connect("nats://localhost:4222")
	sys, _ := natssysclient.NewSysClient(conn)
	return &NatsSource{
		conn: conn,
		sys:  sys,
	}
}

func (n NatsSource) FetchMetrics(ctx context.Context) (map[string]map[string]any, error) {
	metrics := make(map[string]map[string]any)
	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	varz, err := n.sys.Varz(ctx, "server_id", natssysclient.VarzEventOptions{})
	if err != nil {
		return metrics, err
	}

	metrics["varz"] = encodeToMap(varz.Varz)
	options := natssysclient.ConnzEventOptions{ConnzOptions: natssysclient.ConnzOptions{Limit: 10000, Sort: natssysclient.ByLast}}
	connz, err := n.sys.Connz(ctx, "server_id", options)
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
