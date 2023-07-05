package connection

import (
	"fmt"
	"github.com/nats-io/nats.go"
	"github.com/stretchr/testify/require"
	"testing"
)

type ConnMock struct {
	name string
}

func (m *ConnMock) Close() {
}

func mockBuilder(connection *Connection) (*nats.Conn, error) {
	return &nats.Conn{}, nil
}

func TestConnPool_Get(t *testing.T) {
	r := NewMemConnRepo()
	r.Save(&Connection{Id: "c1"})
	p := NewConnPool(r)
	p.build = mockBuilder
	c, err := p.Get("c1")
	require.Nil(t, err)
	c2, _ := p.Get("c1")
	require.Equal(t, c, c2)
}

func TestConnPool_Refresh(t *testing.T) {
	r := NewMemConnRepo()
	r.Save(&Connection{Id: "c1"})
	p := NewConnPool(r)
	p.build = mockBuilder
	c, _ := p.Get("c1")
	p.Refresh("c1")
	c2, _ := p.Get("c1")
	fmt.Println(c, c2)
	require.NotSame(t, c, c2)
}
