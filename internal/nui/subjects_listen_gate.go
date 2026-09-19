package nui

import (
	"context"
	"sync"
)

type listenSlot struct {
	gen    uint64
	cancel context.CancelFunc
}

// coreListenGate cancels an in-flight sample when another starts
// for the same connection.
type coreListenGate struct {
	mu      sync.Mutex
	nextGen uint64
	byConn  map[string]*listenSlot
}

func newCoreListenGate() *coreListenGate {
	return &coreListenGate{byConn: map[string]*listenSlot{}}
}

func (g *coreListenGate) takeover(id string, parent context.Context) (context.Context, context.CancelFunc) {
	if parent == nil {
		parent = context.Background()
	}
	if id == "" {
		id = "_"
	}
	ctx, cancel := context.WithCancel(parent)
	g.mu.Lock()
	defer g.mu.Unlock()
	if existing := g.byConn[id]; existing != nil {
		existing.cancel()
	}
	g.nextGen++
	gen := g.nextGen
	g.byConn[id] = &listenSlot{gen: gen, cancel: cancel}
	return ctx, func() {
		cancel()
		g.mu.Lock()
		if s := g.byConn[id]; s != nil && s.gen == gen {
			delete(g.byConn, id)
		}
		g.mu.Unlock()
	}
}
