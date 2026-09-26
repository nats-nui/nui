package nui

import (
	"context"
	"sync"
)

type listenSlot struct {
	cancel    context.CancelFunc
	available chan struct{}
	users     int
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

func (g *coreListenGate) takeover(id string, parent context.Context) (context.Context, context.CancelFunc) {
	ctx, cancel := context.WithCancel(parent)
	g.mu.Lock()
	slot := g.byConn[id]
	if slot == nil {
		slot = &listenSlot{available: make(chan struct{}, 1)}
		slot.available <- struct{}{}
		g.byConn[id] = slot
	} else {
		slot.cancel()
	}
	slot.cancel = cancel
	slot.users++
	g.mu.Unlock()

	acquired := false
	select {
	case <-slot.available:
		acquired = true
	case <-ctx.Done():
	}
	var once sync.Once
	return ctx, func() {
		once.Do(func() {
			cancel()
			if acquired {
				slot.available <- struct{}{}
			}
			g.mu.Lock()
			slot.users--
			if slot.users == 0 {
				delete(g.byConn, id)
			}
			g.mu.Unlock()
		})
	}
}
