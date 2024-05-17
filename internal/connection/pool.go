package connection

import (
	"errors"
	"github.com/nats-io/nats.go"
	"github.com/nats-io/nkeys"
	"strings"
	"sync"
	"time"
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
		err := p.refreshLocked(id)
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
	return p.refreshLocked(id)
}

func (p *ConnPool[T]) Purge() {
	for k, c := range p.conns {
		if _, err := p.repo.GetById(k); err != nil {
			c.Close()
			delete(p.conns, k)
		}
	}
}

func (p *ConnPool[T]) refreshLocked(id string) error {
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
		nats.MaxReconnects(-1),
		nats.PingInterval(2 * time.Second),
		nats.MaxPingsOutstanding(3),
	}
	options = appendAuthOption(connection, options)
	return NewNatsConn(strings.Join(connection.Hosts, ", "), options...)
}

func appendAuthOption(connection *Connection, options []nats.Option) []nats.Option {
	var activeAuth *Auth
	for _, auth := range connection.Auth {
		if auth.Active {
			activeAuth = &auth
			break
		}
	}
	if activeAuth == nil {
		return options
	}
	switch activeAuth.Mode {
	case "":
		return options
	case AuthModeNone:
		return options
	case AuthModeToken:
		return append(options, nats.Token(activeAuth.Token))
	case AuthModeUserPassword:
		return append(options, nats.UserInfo(activeAuth.Username, activeAuth.Password))
	case AuthModeNKey:
		return append(options, buildNkeyOption(activeAuth))
	case AuthModeJwt:
		return append(options, nats.UserJWTAndSeed(activeAuth.Jwt, activeAuth.NKeySeed))
	case AuthModeJwtBearer:
		return append(options, buildJwtBearerOption(activeAuth))
	case AuthModeCredsFile:
		return append(options, nats.UserCredentials(activeAuth.Creds))
	}
	return options
}

func buildNkeyOption(activeAuth *Auth) nats.Option {
	nKeyOption := nats.Nkey(
		activeAuth.Username,
		func(b []byte) ([]byte, error) {
			sk, err := nkeys.FromSeed([]byte(activeAuth.NKeySeed))
			if err != nil {
				return nil, err
			}
			return sk.Sign(b)
		},
	)
	return nKeyOption
}

func buildJwtBearerOption(activeAuth *Auth) nats.Option {
	jwtOption := nats.UserJWT(
		func() (string, error) { return activeAuth.Jwt, nil },
		func([]byte) ([]byte, error) { return []byte{}, nil },
	)
	return jwtOption
}
