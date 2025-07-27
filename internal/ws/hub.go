package ws

import (
	"context"
	"errors"
	"github.com/mitchellh/mapstructure"
	"github.com/nats-io/nats.go"
	natsConn "github.com/nats-nui/nui/internal/connection"
	"github.com/nats-nui/nui/internal/metrics"
	"github.com/nats-nui/nui/pkg/channels"
	"github.com/nats-nui/nui/pkg/logging"
	"sync"
)

type Pool[S Subscription, T Conn[S]] interface {
	Get(id string) (T, error)
}

type Subscription interface {
	Unsubscribe() error
}

type MetricsService interface {
	Start(ctx context.Context, cfg metrics.ServiceCfg) (<-chan metrics.Metrics, error)
}

type Conn[S Subscription] interface {
	ChanSubscribe(subj string, ch chan *nats.Msg) (S, error)
	ObserveConnectionEvents(ctx context.Context) <-chan natsConn.ConnStatusChanged
	Status() nats.Status
	LastEvent() (string, error)
}

type IHub interface {
	Register(ctx context.Context, clientId, connectionId string, req <-chan *Request, messages chan<- Payload) error
}

type Hub[S Subscription, T Conn[S]] struct {
	pool                     Pool[S, T]
	reg                      map[string]*ClientConn[S]
	connectionMutex          sync.Mutex
	l                        logging.Slogger
	ms                       MetricsService
	skipLastConnectionStatus bool
}

func NewHub[S Subscription, T Conn[S]](pool Pool[S, T], ms MetricsService, l logging.Slogger) *Hub[S, T] {
	return &Hub[S, T]{
		pool: pool,
		reg:  make(map[string]*ClientConn[S]),
		ms:   ms,
		l:    l,
	}
}

func NewNatsHub(pool Pool[*nats.Subscription, *natsConn.NatsConn], ms MetricsService, l logging.Slogger) *Hub[*nats.Subscription, *natsConn.NatsConn] {
	return NewHub[*nats.Subscription, *natsConn.NatsConn](pool, ms, l)
}

func (h *Hub[S, T]) Register(ctx context.Context, clientId, connectionId string, req <-chan *Request, messages chan<- Payload) error {
	h.l.Info("registering new client ws connection to hub", "connection-id", connectionId, "client-id", clientId)
	h.purgeConnection(clientId)
	err := h.registerConnection(clientId, connectionId, req, messages)
	if err != nil {
		return err
	}
	go func() { _ = h.HandleConnectionEvents(ctx, clientId, messages) }()
	go func() { _ = h.HandleRequests(ctx, clientId, req, messages) }()
	return nil
}

func (h *Hub[S, T]) HandleRequests(ctx context.Context, clientId string, req <-chan *Request, messages chan<- Payload) error {
	for {
		select {
		case <-ctx.Done():
			h.tearDownClient(clientId)
			return nil
		case r, ok := <-req:
			if !ok {
				h.tearDownClient(clientId)
				return nil
			}
			err := h.handleRequestsByType(ctx, clientId, r, messages)
			if err != nil {
				messages = h.sendErr(messages, err)
			}
		}
	}
}

func (h *Hub[S, T]) tearDownClient(clientId string) {
	h.disableMetrics(clientId)
	h.purgeConnection(clientId)
}

func (h *Hub[S, T]) handleRequestsByType(ctx context.Context, clientId string, r *Request, messages chan<- Payload) error {
	switch r.Type {
	case subReqType:
		subReq := &SubsReq{}
		return decodeAndHandleRequest(ctx, clientId, subReq, r.Payload, h.HandleSubRequest, messages)
	case metricsReqType:
		metricsReq := &MetricsReq{}
		return decodeAndHandleRequest(ctx, clientId, metricsReq, r.Payload, h.HandleMetricsRequest, messages)
	}
	return errors.New("unknown request type")
}

type reqHandler[T any] func(ctx context.Context, clientId string, req *T, messages chan<- Payload)

func decodeAndHandleRequest[T any](ctx context.Context, clientId string, req *T, payload any, handler reqHandler[T], messages chan<- Payload) error {
	err := mapstructure.Decode(payload, req)
	if err != nil {
		return err
	}
	handler(ctx, clientId, req, messages)
	return nil
}

func (h *Hub[S, T]) sendErr(messages chan<- Payload, err error) chan<- Payload {
	h.l.Error("error ws handling request", "error", err)
	select {
	case messages <- Error{Error: err.Error()}:
	default:
	}
	return messages
}

func (h *Hub[S, T]) HandleSubRequest(_ context.Context, clientId string, subReq *SubsReq, messages chan<- Payload) {
	h.l.Info("registering new client ws subscription to subjects", "client-id", clientId, "subjects", subReq.Subjects)
	h.purgeSubscriptions(clientId)
	err := h.registerSubscriptions(clientId, subReq)
	if err != nil {
		h.sendErr(messages, err)
	}
}

func (h *Hub[S, T]) purgeConnection(clientId string) {
	h.l.Info("purging client connection", "client-id", clientId)
	h.connectionMutex.Lock()
	defer h.connectionMutex.Unlock()
	h.purgeConnectionLocked(clientId)
}

func (h *Hub[S, T]) purgeConnectionLocked(clientId string) {
	currentConn, ok := h.reg[clientId]
	if ok {
		h.purgeClientSubscriptions(currentConn)
	}
	delete(h.reg, clientId)
}

func (h *Hub[S, T]) purgeSubscriptions(clientId string) {
	h.connectionMutex.Lock()
	defer h.connectionMutex.Unlock()
	h.purgeSubscriptionsLocked(clientId)
}

func (h *Hub[S, T]) purgeSubscriptionsLocked(clientId string) {
	currentConn, ok := h.reg[clientId]
	if ok {
		h.purgeClientSubscriptions(currentConn)
	}
}

func (h *Hub[S, T]) purgeClientSubscriptions(clientConn *ClientConn[S]) {
	clientConn.UnsubscribeAll()
}

func (h *Hub[S, T]) registerConnection(clientId, connectionId string, req <-chan *Request, messages chan<- Payload) error {
	h.l.Debug("registering new client ws connection", "client-id", clientId)
	_, err := h.pool.Get(connectionId)
	if err != nil {
		return err
	}
	h.reg[clientId] = NewWClientConn[S](connectionId, req, messages)
	return nil
}

func (h *Hub[S, T]) registerSubscriptions(clientId string, req *SubsReq) error {
	clientConn, ok := h.reg[clientId]
	if !ok {
		return errors.New("no client connection found")
	}
	serverConn, err := h.pool.Get(clientConn.ConnectionId)
	if err != nil {
		return err
	}
	chans := make([]<-chan *nats.Msg, 0)
	for _, sbj := range req.Subjects {
		s := NewClientSub[S](sbj)
		sub, err := serverConn.ChanSubscribe(sbj, s.Messages)
		if err != nil {
			return err
		}
		s.Sub = sub
		chans = append(chans, s.Messages)
		clientConn.AddSubscription(s)
	}
	go parseToClientMessage(channels.FanIn(10, chans...), clientConn.Messages)
	return nil
}

func (h *Hub[S, T]) HandleConnectionEvents(ctx context.Context, clientId string, clientMgs chan<- Payload) error {
	clientConn, ok := h.reg[clientId]
	if !ok {
		return errors.New("no client connection found")
	}
	serverConn, err := h.pool.Get(clientConn.ConnectionId)
	if err != nil {
		return err
	}
	events := serverConn.ObserveConnectionEvents(ctx)
	if !h.skipLastConnectionStatus {
		firstStatus, firstConnErr := serverConn.LastEvent()
		cm := &ConnectionStatus{Status: firstStatus, Error: errorString(firstConnErr)}
		select {
		case clientMgs <- cm:
		default:
		}
	}
	for {
		select {
		case msg, ok := <-events:
			if !ok {
				return nil
			}
			cm := &ConnectionStatus{
				Status: msg.Status,
				Error:  errorString(msg.Err),
			}
			clientMgs <- cm
		}
	}
}

func (h *Hub[S, T]) HandleMetricsRequest(ctx context.Context, id string, req *MetricsReq, messages chan<- Payload) {
	if req.Enabled {
		h.l.Debug("requesting metrics for client", "client-id", id)
		h.enableMetrics(ctx, id, messages)
		return
	}
	h.l.Debug("disabling metrics for client", "client-id", id)
	h.disableMetrics(id)
}

func (h *Hub[S, T]) enableMetrics(ctx context.Context, id string, messages chan<- Payload) {
	h.connectionMutex.Lock()
	defer h.connectionMutex.Unlock()
	h.enableMetricsLocked(ctx, id, messages)
}

func (h *Hub[S, T]) enableMetricsLocked(ctx context.Context, id string, messages chan<- Payload) {
	clientConn, ok := h.reg[id]
	if clientConn.MetricsCancel != nil {
		return
	}
	if !ok {
		h.l.Error("no client connection found for metrics", "client-id", id)
		return
	}
	ctx, cancel := context.WithCancel(ctx)
	clientConn.MetricsCancel = cancel
	metricsCfg := metrics.ServiceCfg{
		ConnectionId:      clientConn.ConnectionId,
		PollingIntervalMs: 1000, // Default polling interval
	}
	m, err := h.ms.Start(ctx, metricsCfg)
	if err != nil {
		h.l.Error("error starting metrics service", "error", err)
		return
	}
	go relayMetricsToClient(ctx, m, messages)
}

func relayMetricsToClient(ctx context.Context, m <-chan metrics.Metrics, messages chan<- Payload) {
	for {
		select {
		case <-ctx.Done():
			return
		case m, ok := <-m:
			if !ok {
				return
			}
			select {
			case messages <- &MetricsResp{Nats: m.Nats, Error: errorString(m.Error)}:
			default:
			}
		}
	}
}

func (h *Hub[S, T]) disableMetrics(id string) {
	h.connectionMutex.Lock()
	defer h.connectionMutex.Unlock()
	h.disableMetricsLocked(id)
}

func (h *Hub[S, T]) disableMetricsLocked(id string) {
	clientConn, ok := h.reg[id]
	if !ok {
		h.l.Error("no client connection found for metrics", "client-id", id)
		return
	}
	if clientConn.MetricsCancel != nil {
		clientConn.MetricsCancel()
		clientConn.MetricsCancel = nil
	}
}

func parseToClientMessage(natsMsg <-chan *nats.Msg, clientMgs chan<- Payload) {
	for {
		select {
		case msg, ok := <-natsMsg:
			if !ok {
				return
			}
			cm := &NatsMsg{
				Subject: msg.Subject,
				Payload: msg.Data,
				Headers: msg.Header,
			}
			clientMgs <- cm
		}
	}
}

func errorString(err error) string {
	if err != nil {
		return err.Error()
	}
	return ""
}
