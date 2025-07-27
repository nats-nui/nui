package metrics

import (
	"context"
	"encoding/json"
	"github.com/google/uuid"
	"github.com/nats-io/nats.go"
	"github.com/nats-nui/nui/internal/connection"
	"github.com/synadia-io/orbit.go/natssysclient"
	"time"
)

const (
	connectionName = "nui-metrics-"
)

type NatsSource struct {
	natsConn *nats.Conn
	sys      *natssysclient.System
}

func NewNatsSource(ctx context.Context, conn *connection.Connection, builder connection.ConnBuilder[*connection.NatsConn]) (*NatsSource, error) {
	adminConn := makeAdminConn(conn)
	natsConn, err := builder(&adminConn)
	go func(natsConn *nats.Conn) {
		<-ctx.Done()
		natsConn.Close()
	}(natsConn.Conn)
	if err != nil {
		return nil, err
	}
	return NewWithNatsConnection(natsConn.Conn)
}

func NewWithNatsConnection(natsConn *nats.Conn) (*NatsSource, error) {
	sys, err := natssysclient.NewSysClient(natsConn)
	if err != nil {
		return nil, err
	}
	return &NatsSource{
		natsConn: natsConn,
		sys:      sys,
	}, nil
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

func makeAdminConn(conn *connection.Connection) connection.Connection {
	id := uuid.New().String()
	adminConn := connection.Connection{
		Id:            id,
		Name:          connectionName + id,
		Hosts:         conn.Hosts,
		InboxPrefix:   "",
		Subscriptions: nil,
		Auth:          []connection.Auth{conn.Metrics.NatsSource.Auth},
		TLSAuth:       connection.TLSAuth{},
		Metrics:       connection.Metrics{},
		Metadata:      nil,
	}
	adminConn.Auth[0].Active = true
	return adminConn
}
