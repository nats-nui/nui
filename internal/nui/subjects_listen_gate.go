package nui

import (
	"context"
	"sync"
)

type listenSlot struct {
	cancel context.CancelFunc
}

// coreListenGate cancels an in-flight sample when another starts
// for the same connection.
type coreListenGate struct {
	mu     sync.Mutex
	byConn map[string]*listenSlot
}

func newCoreListenGate() *coreListenGate {
	return &coreListenGate{byConn: map[string]*listenSlot{}}
}

func (g *coreListenGate) takeover(id string, parent context.Context) (context.Context, context.CancelFunc) {
	ctx, cancel := context.WithCancel(parent)
	g.mu.Lock()
	defer g.mu.Unlock()
	if existing := g.byConn[id]; existing != nil {
		existing.cancel()
	}
	slot := &listenSlot{cancel: cancel}
	g.byConn[id] = slot
	return ctx, func() {
		cancel()
		g.mu.Lock()
		if g.byConn[id] == slot {
			delete(g.byConn, id)
		}
		g.mu.Unlock()
	}
}
