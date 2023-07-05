package connection

import (
	"fmt"
	"github.com/stretchr/testify/require"
	"testing"
)

type ConnMock struct {
	name string
}

func (m *ConnMock) Close() {
}

func mockBuilder(connection *Connection) (*ConnMock, error) {
	return &ConnMock{}, nil
}

var repo ConnRepo
var pool *ConnPool[*ConnMock]

func TestMain(m *testing.M) {
	repo = NewMemConnRepo()
	pool = NewConnPool[*ConnMock](repo, mockBuilder)
	_ = repo.Save(&Connection{Id: "c1"})
	m.Run()
}

func TestConnPool_Get(t *testing.T) {
	c, err := pool.Get("c1")
	require.Nil(t, err)
	c2, _ := pool.Get("c1")
	require.Equal(t, c, c2)
}

func TestConnPool_Refresh(t *testing.T) {
	c, _ := pool.Get("c1")
	pool.Refresh("c1")
	c2, _ := pool.Get("c1")
	fmt.Println(c, c2)
	require.NotSame(t, c, c2)
}
