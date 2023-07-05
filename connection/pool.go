package connection

import (
	"errors"
	"github.com/nats-io/nats.go"
	"strings"
	"sync"
)

type Conn interface {
	Close()
}

type builder = func(connection *Connection) (Conn, error)

type ConnPool struct {
	m     sync.Mutex
	conns map[string]Conn
	repo  ConnRepo
	build builder
}

func NewConnPool(repo ConnRepo) *ConnPool {
	return &ConnPool{
		conns: make(map[string]Conn),
		repo:  repo,
		build: natsBuilder,
	}
}

func (p *ConnPool) Get(id string) (Conn, error) {
	p.m.Lock()
	defer p.m.Unlock()
	if _, ok := p.conns[id]; !ok {
		err := p.refresh(id)
		if err != nil {
			return nil, err
		}
	}
	if c, ok := p.conns[id]; ok {
		return c, nil
	}
	return nil, errors.New("cannot find connection in pool")
}

func (p *Connp)

func (p *ConnPool) Refresh(id string) error {
	p.m.Lock()
	defer p.m.Unlock()
	return p.refresh(id)
}

func (p *ConnPool) refresh(id string) error {
	c, err := p.repo.GetById(id)
	if err != nil {
		return err
	}
	if currentConn := p.conns[id]; currentConn != nil {
		currentConn.Close()
	}
	conn, err := p.build(c)
	if err != nil {
		return err
	}
	p.conns[id] = conn
	return nil
}

func (p *ConnPool) setBuilder(b builder) {
	p.build = b
}

func natsBuilder(connection *Connection) (Conn, error) {
	return nats.Connect(strings.Join(connection.Hosts, ", "))
}
