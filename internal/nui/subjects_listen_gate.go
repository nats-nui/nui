package nui

import (
	"context"
	"errors"
	"sync"
)

var errListenBusy = errors.New("busy")

type listenSlot struct {
	gen    uint64
	cancel context.CancelFunc
}

// coreListenGate keeps NUI from stacking catch-all samples.
// One in-flight listen per configured connection. A second click
// cancels the first. A small global cap covers two open cards
// without opening a DialOnce per click.
type coreListenGate struct {
	mu      sync.Mutex
	max     int
	nextGen uint64
	byConn  map[string]*listenSlot
}

func newCoreListenGate(max int) *coreListenGate {
	if max < 1 {
		max = 1
	}
	return &coreListenGate{max: max, byConn: map[string]*listenSlot{}}
}

func (g *coreListenGate) tryTakeover(id string, parent context.Context) (context.Context, context.CancelFunc, error) {
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
	} else if len(g.byConn) >= g.max {
		cancel()
		return nil, nil, errListenBusy
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
	}, nil
}

func (g *coreListenGate) active() int {
	g.mu.Lock()
	defer g.mu.Unlock()
	return len(g.byConn)
}
