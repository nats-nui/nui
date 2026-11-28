package nui

import (
	"context"
	"slices"
	"sync"

	"github.com/nats-nui/nui/internal/connection"
)

type listenSlot struct {
	config *connection.Connection
	cancel context.CancelFunc
	active chan struct{}
	users  int
}

// coreListenGate cancels an in-flight sample when another starts
// for the same connection, and waits for its resources to be released.
type coreListenGate struct {
	mu     sync.Mutex
	byConn map[string]*listenSlot
}

func newCoreListenGate() *coreListenGate {
	return &coreListenGate{byConn: map[string]*listenSlot{}}
}

func (g *coreListenGate) stop(id string) {
	g.mu.Lock()
	defer g.mu.Unlock()
	if slot := g.byConn[id]; slot != nil {
		// Keep the slot until its holder and waiters release it. Removing it
		// here would let a new sample bypass the cancelled holder's cleanup.
		slot.cancel()
	}
}

// Record the settings actually used by this sample. A superseded config read
// may finish after its replacement starts and must not overwrite the new slot.
func (g *coreListenGate) setConfig(id string, ctx context.Context, cfg *connection.Connection) {
	g.mu.Lock()
	defer g.mu.Unlock()
	if slot := g.byConn[id]; slot != nil && ctx.Err() == nil {
		slot.checkSettings(cfg)
	}
}

func (g *coreListenGate) stopIfChanged(cfg *connection.Connection) {
	g.mu.Lock()
	defer g.mu.Unlock()
	if slot := g.byConn[cfg.Id]; slot != nil {
		slot.checkSettings(cfg)
	}
}

// The first observed settings may come from the sample's read or an import.
// Both must agree throughout the sample, regardless of which completes first.
func (slot *listenSlot) checkSettings(cfg *connection.Connection) {
	if slot.config == nil {
		slot.config = cfg
	} else if !sameSampleSettings(slot.config, cfg) {
		slot.cancel()
	}
}

func sameSampleSettings(a, b *connection.Connection) bool {
	return a.Name == b.Name && slices.Equal(a.Hosts, b.Hosts) &&
		a.InboxPrefix == b.InboxPrefix && slices.Equal(a.Auth, b.Auth) && a.TLSAuth == b.TLSAuth
}

func (g *coreListenGate) takeover(id string, parent context.Context) (context.Context, context.CancelFunc) {
	ctx, cancel := context.WithCancel(parent)
	g.mu.Lock()
	slot := g.byConn[id]
	if slot == nil {
		slot = &listenSlot{active: make(chan struct{}, 1)}
		g.byConn[id] = slot
	} else {
		slot.cancel()
	}
	slot.config = nil
	slot.cancel = cancel
	slot.users++
	g.mu.Unlock()

	acquired := false
	select {
	case slot.active <- struct{}{}:
		acquired = true
	case <-ctx.Done():
	}
	return ctx, sync.OnceFunc(func() {
		cancel()
		if acquired {
			<-slot.active
		}
		g.mu.Lock()
		slot.users--
		if slot.users == 0 {
			delete(g.byConn, id)
		}
		g.mu.Unlock()
	})
}
