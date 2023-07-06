package connection

import (
	"errors"
	"sync"
)
import "github.com/google/uuid"

type ConnRepo interface {
	All() map[string]*Connection
	GetById(id string) (*Connection, error)
	Save(c *Connection) error
	Remove(id string) error
}

type MemConnRepo struct {
	conns *sync.Map
}

func NewMemConnRepo() *MemConnRepo {
	return &MemConnRepo{
		conns: &sync.Map{},
	}
}

func (r *MemConnRepo) All() map[string]*Connection {
	conns := make(map[string]*Connection)
	r.conns.Range(func(key, value interface{}) bool {
		conns[key.(string)] = value.(*Connection)
		return true
	})
	return conns
}

func (r *MemConnRepo) GetById(id string) (*Connection, error) {
	if c, ok := r.conns.Load(id); ok {
		return c.(*Connection), nil
	}
	return nil, errors.New("cannot find connection in pool")
}

func (r *MemConnRepo) Save(c *Connection) error {
	if c.Id == "" {
		c.Id = uuid.New().String()
	}
	r.conns.Store(c.Id, c)
	return nil
}

func (r *MemConnRepo) Remove(id string) error {
	r.conns.Delete(id)
	return nil
}
