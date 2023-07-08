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

type poolSuite struct {
	repo ConnRepo
	pool *ConnPool[*ConnMock]
}

func setupPoolSuite() *poolSuite {
	s := &poolSuite{}
	s.repo = NewMemConnRepo()
	s.pool = NewConnPool[*ConnMock](s.repo, mockBuilder)
	_, _ = s.repo.Save(&Connection{Id: "c1"})
	return s
}

func TestConnPool_Get(t *testing.T) {
	s := setupPoolSuite()
	c, err := s.pool.Get("c1")
	require.Nil(t, err)
	c2, _ := s.pool.Get("c1")
	require.Equal(t, c, c2)
}

func TestConnPool_Refresh(t *testing.T) {
	s := setupPoolSuite()
	c, _ := s.pool.Get("c1")
	s.pool.Refresh("c1")
	c2, _ := s.pool.Get("c1")
	fmt.Println(c, c2)
	require.NotSame(t, c, c2)
}
