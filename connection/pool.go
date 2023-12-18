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

type Pool[T Conn] interface {
	Get(id string) (T, error)
	Refresh(id string) error
	Purge()
}

type ConnPool[T Conn] struct {
	m     sync.Mutex
	conns map[string]T
	repo  ConnRepo
	build func(connection *Connection) (T, error)
}

func NewConnPool[T Conn](repo ConnRepo, builder func(connection *Connection) (T, error)) *ConnPool[T] {
	return &ConnPool[T]{
		conns: make(map[string]T),
		repo:  repo,
		build: builder,
	}
}

func NewNatsConnPool(repo ConnRepo) *ConnPool[*NatsConn] {
	return NewConnPool[*NatsConn](repo, natsBuilder)
}

func (p *ConnPool[T]) Get(id string) (T, error) {
	p.m.Lock()
	defer p.m.Unlock()
	if t, ok := p.conns[id]; !ok {
		err := p.refresh(id)
		if err != nil {
			return t, err
		}
	}
	c, ok := p.conns[id]
	if ok {
		return c, nil
	}
	return c, errors.New("cannot find connection in pool")
}

func (p *ConnPool[T]) Refresh(id string) error {
	p.m.Lock()
	defer p.m.Unlock()
	return p.refresh(id)
}

func (p *ConnPool[T]) Purge() {
	for k, c := range p.conns {
		if _, err := p.repo.GetById(k); err != nil {
			c.Close()
			delete(p.conns, k)
		}
	}
}

func (p *ConnPool[T]) refresh(id string) error {
	c, err := p.repo.GetById(id)
	if err != nil {
		return err
	}
	if currentConn, ok := p.conns[id]; ok {
		currentConn.Close()
	}
	conn, err := p.build(c)
	if err != nil {
		return err
	}
	p.conns[id] = conn
	return nil
}

func natsBuilder(connection *Connection) (*NatsConn, error) {
	options := []nats.Option{
		nats.RetryOnFailedConnect(true),
	}
	options = appendAuthOption(connection, options)
	return NewNatsConn(strings.Join(connection.Hosts, ", "), options...)
}

func appendAuthOption(connection *Connection, options []nats.Option) []nats.Option {
	if len(connection.Auth) == 0 {
		return options
	}
	preferredAuth := connection.Auth[0]
	switch preferredAuth.Mode {
	case "":
		return options
	case AuthModeNone:
		return options
	case AuthModeToken:
		return append(options, nats.Token(preferredAuth.Token))
	case AuthModeUserPassword:
		return append(options, nats.UserInfo(preferredAuth.Username, preferredAuth.Password))
	case AuthModeJwt:
		return append(options, nats.UserJWTAndSeed(preferredAuth.Jwt, preferredAuth.NKeySeed))
	case AuthModeCredsFile:
		return append(options, nats.UserCredentials(preferredAuth.Creds))
	}
	return options
}
