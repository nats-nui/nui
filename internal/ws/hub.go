package ws

import (
	"context"
	"errors"
	"sync"
	"time"

	"github.com/mitchellh/mapstructure"
	"github.com/nats-io/nats.go"
	natsConn "github.com/nats-nui/nui/internal/connection"
	"github.com/nats-nui/nui/internal/metrics"
	"github.com/nats-nui/nui/pkg/channels"
	"github.com/nats-nui/nui/pkg/logging"
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

// AuditLogger interface for logging subscription events
type AuditLogger interface {
	LogSubscriptionExpiry(userID, subject, reason string) error
}

type Hub[S Subscription, T Conn[S]] struct {
	pool                     Pool[S, T]
	reg                      map[string]*ClientConn[S]
	connectionMutex          sync.Mutex
	l                        logging.Slogger
	ms                       MetricsService
	skipLastConnectionStatus bool
	auditLogger              AuditLogger
}

func NewHub[S Subscription, T Conn[S]](pool Pool[S, T], ms MetricsService, l logging.Slogger) *Hub[S, T] {
	return &Hub[S, T]{
		pool: pool,
		reg:  make(map[string]*ClientConn[S]),
		ms:   ms,
		l:    l,
	}
}

// SetAuditLogger sets the audit logger for logging subscription events
func (h *Hub[S, T]) SetAuditLogger(logger AuditLogger) {
	h.auditLogger = logger
}

// logSubscriptionExpiry logs a subscription expiry event to audit
func (h *Hub[S, T]) logSubscriptionExpiry(clientId, subject, reason string) {
	if h.auditLogger == nil {
		return
	}
	// Get user ID from client connection if available
	h.connectionMutex.Lock()
	clientConn, ok := h.reg[clientId]
	userID := ""
	if ok {
		userID = clientConn.UserID
	}
	h.connectionMutex.Unlock()

	go func() {
		if err := h.auditLogger.LogSubscriptionExpiry(userID, subject, reason); err != nil {
			h.l.Error("failed to log subscription expiry", "error", err)
		}
	}()
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

	// Check if session-based cleanup is enabled
	h.connectionMutex.Lock()
	clientConn, ok := h.reg[clientId]
	h.connectionMutex.Unlock()

	if ok && clientConn.SessionBased {
		// Start grace period timer before cleanup
		h.l.Info("starting disconnect grace period", "client-id", clientId, "grace-period", DisconnectGracePeriod)
		clientConn.DisconnectTimer = time.AfterFunc(DisconnectGracePeriod, func() {
			h.l.Info("grace period expired, cleaning up subscriptions", "client-id", clientId)
			// Log all subscriptions as expired due to disconnect
			for _, sub := range clientConn.Subs {
				h.logSubscriptionExpiry(clientId, sub.Subject, "disconnect")
			}
			h.purgeConnection(clientId)
		})
	} else {
		h.purgeConnection(clientId)
	}
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

func (h *Hub[S, T]) HandleSubRequest(ctx context.Context, clientId string, subReq *SubsReq, messages chan<- Payload) {
	h.l.Info("registering new client ws subscription to subjects", "client-id", clientId, "subjects", subReq.Subjects)

	// Check subscription limit
	h.connectionMutex.Lock()
	clientConn, ok := h.reg[clientId]
	h.connectionMutex.Unlock()

	if ok && !clientConn.CanAddSubscription(len(subReq.Subjects)) {
		h.l.Warn("subscription limit exceeded", "client-id", clientId, "requested", len(subReq.Subjects), "limit", MaxSubscriptionsPerUser)
		messages <- &SubExpired{
			Subject: "",
			Reason:  "limit",
		}
		h.sendErr(messages, errors.New("subscription limit exceeded: max 10 active subscriptions per user"))
		return
	}

	// Set subscription options
	if ok {
		clientConn.SetSubscriptionOptions(subReq.TTLMinutes, subReq.MaxMessages, subReq.SessionBased)
	}

	h.purgeSubscriptions(clientId)
	err := h.registerSubscriptions(clientId, subReq)
	if err != nil {
		h.sendErr(messages, err)
		return
	}

	// Cancel previous TTL checker if exists
	if clientConn.TTLCheckerCancel != nil {
		clientConn.TTLCheckerCancel()
	}

	// Create new context for TTL checker
	ttlCtx, ttlCancel := context.WithCancel(ctx)
	clientConn.TTLCheckerCancel = ttlCancel

	// Start TTL checker for this client
	go h.startTTLChecker(ttlCtx, clientId, messages)
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
	if clientConn.ParserCancel != nil {
		clientConn.ParserCancel()
		clientConn.ParserCancel = nil
	}
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

	// Use default values if not specified
	ttlMinutes := req.TTLMinutes
	if ttlMinutes <= 0 {
		ttlMinutes = clientConn.TTLMinutes
	}
	maxMessages := req.MaxMessages
	if maxMessages <= 0 {
		maxMessages = clientConn.MaxMessages
	}

	chans := make([]<-chan *nats.Msg, 0)
	for _, sbj := range req.Subjects {
		s := NewClientSub[S](sbj, ttlMinutes, maxMessages)
		sub, err := serverConn.ChanSubscribe(sbj, s.Messages)
		if err != nil {
			return err
		}
		s.Sub = sub
		chans = append(chans, s.Messages)
		clientConn.AddSubscription(s)
	}

	// Cancel previous parser if exists
	if clientConn.ParserCancel != nil {
		clientConn.ParserCancel()
	}

	// Create new context for parser
	parserCtx, parserCancel := context.WithCancel(context.Background())
	clientConn.ParserCancel = parserCancel

	go h.parseToClientMessageWithTracking(parserCtx, clientId, channels.FanIn(10, chans...), clientConn.Messages)
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

// parseToClientMessageWithTracking forwards messages with message count tracking
func (h *Hub[S, T]) parseToClientMessageWithTracking(ctx context.Context, clientId string, natsMsg <-chan *nats.Msg, clientMgs chan<- Payload) {
	for {
		select {
		case <-ctx.Done():
			return
		case msg, ok := <-natsMsg:
			if !ok {
				return
			}

			// Check message limits for this subscription
			h.connectionMutex.Lock()
			clientConn, connOk := h.reg[clientId]
			h.connectionMutex.Unlock()

			if connOk {
				for i := range clientConn.Subs {
					sub := &clientConn.Subs[i]
					if sub.Subject == msg.Subject || matchSubject(sub.Subject, msg.Subject) {
						if sub.IncrementMessageCount() {
							// Max messages reached, mark as expired
							sub.MarkExpired()
							h.l.Info("subscription max messages reached", "client-id", clientId, "subject", sub.Subject)
							h.logSubscriptionExpiry(clientId, sub.Subject, "max_messages")
							select {
							case clientMgs <- &SubExpired{Subject: sub.Subject, Reason: "max_messages"}:
							default:
							}
						}
						break
					}
				}
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

// startTTLChecker periodically checks for expired subscriptions
func (h *Hub[S, T]) startTTLChecker(ctx context.Context, clientId string, messages chan<- Payload) {
	ticker := time.NewTicker(30 * time.Second) // Check every 30 seconds
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			h.connectionMutex.Lock()
			clientConn, ok := h.reg[clientId]
			h.connectionMutex.Unlock()

			if !ok {
				return
			}

			expired := clientConn.RemoveExpiredSubscriptions()
			for _, sub := range expired {
				h.l.Info("subscription TTL expired", "client-id", clientId, "subject", sub.Subject)
				h.logSubscriptionExpiry(clientId, sub.Subject, "ttl")
				select {
				case messages <- &SubExpired{Subject: sub.Subject, Reason: "ttl"}:
				default:
				}
			}
		}
	}
}

func errorString(err error) string {
	if err != nil {
		return err.Error()
	}
	return ""
}

// matchSubject checks if a subscription subject matches a target subject with NATS wildcards
func matchSubject(subscription, target string) bool {
	if subscription == target {
		return true
	}

	subTokens := splitSubject(subscription)
	targetTokens := splitSubject(target)

	return matchTokens(subTokens, targetTokens)
}

func splitSubject(subject string) []string {
	if subject == "" {
		return nil
	}
	result := make([]string, 0)
	start := 0
	for i := 0; i < len(subject); i++ {
		if subject[i] == '.' {
			result = append(result, subject[start:i])
			start = i + 1
		}
	}
	result = append(result, subject[start:])
	return result
}

func matchTokens(subTokens, targetTokens []string) bool {
	subIdx := 0
	targetIdx := 0

	for subIdx < len(subTokens) && targetIdx < len(targetTokens) {
		subToken := subTokens[subIdx]

		if subToken == ">" {
			return targetIdx < len(targetTokens)
		}

		if subToken == "*" {
			subIdx++
			targetIdx++
			continue
		}

		if subToken != targetTokens[targetIdx] {
			return false
		}

		subIdx++
		targetIdx++
	}

	return subIdx == len(subTokens) && targetIdx == len(targetTokens)
}
