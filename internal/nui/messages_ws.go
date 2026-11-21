package nui

import (
	"context"
	"errors"
	"time"

	fasthttpws "github.com/fasthttp/websocket"
	"github.com/gofiber/contrib/websocket"
	"github.com/google/uuid"
	"github.com/nats-nui/nui/internal/ws"
)

func (a *App) HandleWsSub(c *websocket.Conn) {
	connId := c.Query("id")
	if connId == "" {
		writeError(c, 4422, errors.New("id is required"))
		return
	}
	conn, err := a.nui.ConnRepo.GetById(connId)
	if err != nil {
		writeError(c, 4404, err)
		return
	}
	ctx, cancel := context.WithCancel(a.ctx)
	defer cancel()
	clientId := uuid.NewString()
	a.l.Info("incoming ws connection", "connection-id", conn.Id, "client-id", clientId)

	reqCh := make(chan *ws.Request, 1)
	msgCh := make(chan ws.Payload, 1000)

	err = a.nui.Hub.Register(ctx, clientId, conn.Id, reqCh, msgCh)
	if err != nil {
		writeError(c, 4500, err)
		return
	}

	done := make(chan struct{}, 2)
	go func() {
		HandleWsMsgs(c, ctx, msgCh, cancel)
		done <- struct{}{}
	}()
	go func() {
		HandleWsRequest(c, ctx, reqCh, cancel)
		done <- struct{}{}
	}()

	<-ctx.Done()
	socket := c.NetConn()
	_ = socket.SetDeadline(time.Now())
	// A frame that finishes encoding after cancellation can reset the write deadline.
	retry := time.NewTicker(100 * time.Millisecond)
	defer retry.Stop()
	for stopped := 0; stopped < 2; {
		select {
		case <-done:
			stopped++
		case <-retry.C:
			_ = socket.SetWriteDeadline(time.Now())
		}
	}
}

func HandleWsRequest(c *websocket.Conn, ctx context.Context, reqCh chan *ws.Request, cancel context.CancelFunc) {
	for {
		req := &ws.Request{}
		err := c.ReadJSON(req)
		if err != nil {
			var closeErr *fasthttpws.CloseError
			if ctx.Err() == nil && !errors.As(err, &closeErr) {
				writeError(c, 4422, err)
			}
			cancel()
			return
		}
		select {
		case <-ctx.Done():
			return
		case reqCh <- req:
		default:
		}
	}
}

func HandleWsMsgs(c *websocket.Conn, ctx context.Context, msgCh chan ws.Payload, cancel context.CancelFunc) {
	for {
		select {
		case <-ctx.Done():
			return
		case msg := <-msgCh:
			message := ws.NewWsMessage(msg)
			err := c.WriteJSON(message)
			if err != nil {
				if ctx.Err() == nil {
					writeError(c, 4422, err)
				}
				cancel()
				return
			}
		}
	}
}

func writeError(c *websocket.Conn, status int, err error) {
	_ = c.WriteControl(
		websocket.CloseMessage,
		websocket.FormatCloseMessage(status, err.Error()), time.Now().Add(time.Second))
}
