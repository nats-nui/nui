package connection

import (
	"github.com/nats-io/nats.go"
	"github.com/nats-io/nkeys"
	"sync"
)

type Conn interface {
	Close()
}

type Pool[T Conn] interface {
	Get(id string) (T, error)
	Refresh(id string) error
	Invalidate(id string)
}

type ConnPool[T Conn] struct {
	dialMu  sync.Mutex
	cacheMu sync.Mutex
	conns   map[string]T
	// dialMu permits one build at a time. Invalidate clears its ID under
	// cacheMu so a superseded result cannot enter the cache.
	pending *string
	repo    ConnRepo
	build   func(connection *Connection) (T, error)
}

func NewConnPool[T Conn](repo ConnRepo, builder ConnBuilder[T]) *ConnPool[T] {
	return &ConnPool[T]{
		conns: make(map[string]T),
		repo:  repo,
		build: builder,
	}
}

func NewNatsConnPool(repo ConnRepo) *ConnPool[*NatsConn] {
	return NewConnPool[*NatsConn](repo, NatsBuilder)
}

func (p *ConnPool[T]) Get(id string) (T, error) {
	return p.get(id, false)
}

func (p *ConnPool[T]) Refresh(id string) error {
	_, err := p.get(id, true)
	return err
}

func (p *ConnPool[T]) Invalidate(id string) {
	p.cacheMu.Lock()
	defer p.cacheMu.Unlock()
	if p.pending != nil && *p.pending == id {
		p.pending = nil
	}
	p.closeCachedLocked(id)
}

func (p *ConnPool[T]) closeCachedLocked(id string) {
	if conn, ok := p.conns[id]; ok {
		delete(p.conns, id)
		conn.Close()
	}
}

func (p *ConnPool[T]) get(id string, refresh bool) (T, error) {
	p.dialMu.Lock()
	defer p.dialMu.Unlock()
	var zero T
	for {
		p.cacheMu.Lock()
		if conn, ok := p.conns[id]; ok && !refresh {
			p.cacheMu.Unlock()
			return conn, nil
		}
		cfg, err := p.repo.GetById(id)
		if err != nil {
			p.cacheMu.Unlock()
			return zero, err
		}
		p.closeCachedLocked(id)
		dialID := id // Only a cache miss or refresh needs an addressable ID.
		p.pending = &dialID
		p.cacheMu.Unlock()

		conn, err := p.build(cfg)
		p.cacheMu.Lock()
		if p.pending != nil {
			p.pending = nil
			if err == nil {
				p.conns[id] = conn
			} else {
				conn = zero
			}
			p.cacheMu.Unlock()
			return conn, err
		}
		p.cacheMu.Unlock()
		if err == nil {
			conn.Close()
		}
	}
}

func appendTLSAuthOptions(connection *Connection, options []nats.Option) []nats.Option {
	if connection.TLSAuth.Enabled {
		if connection.TLSAuth.CertPath != "" && connection.TLSAuth.KeyPath != "" {
			options = append(options, nats.ClientCert(connection.TLSAuth.CertPath, connection.TLSAuth.KeyPath))
		}
		if connection.TLSAuth.CaPath != "" {
			options = append(options, nats.RootCAs(connection.TLSAuth.CaPath))
		}
	}
	if connection.TLSAuth.HandshakeFirst {
		options = append(options, nats.TLSHandshakeFirst())
	}
	return options
}

func appendInboxPrefixOption(connection *Connection, options []nats.Option) []nats.Option {
	if connection.InboxPrefix != "" {
		options = append(options, nats.CustomInboxPrefix(connection.InboxPrefix))
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
