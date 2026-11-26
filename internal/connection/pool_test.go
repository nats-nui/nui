package connection

import (
	"errors"
	"fmt"
	"github.com/stretchr/testify/require"
	"testing"
	"time"
)

type ConnMock struct {
	closed bool
}

func (m *ConnMock) Close() {
	m.closed = true
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

func TestConnPool_GetRetriesAfterFailedRefresh(t *testing.T) {
	s := setupPoolSuite()
	dialErr := errors.New("broker unavailable")
	attempts := 0
	s.pool.build = func(c *Connection) (*ConnMock, error) {
		attempts++
		if attempts == 2 {
			return nil, dialErr
		}
		return mockBuilder(c)
	}

	first, err := s.pool.Get("c1")
	require.NoError(t, err)

	require.ErrorIs(t, s.pool.Refresh("c1"), dialErr)
	require.True(t, first.closed)

	recovered, err := s.pool.Get("c1")
	require.NoError(t, err)
	require.NotNil(t, recovered)
	require.NotSame(t, first, recovered)
	require.False(t, recovered.closed)
	require.Equal(t, 3, attempts)
}

func TestConnPool_RetiresInFlightDial(t *testing.T) {
	for _, operation := range []string{"reimport", "delete"} {
		t.Run(operation, func(t *testing.T) {
			repo := NewMemConnRepo()
			_, err := repo.Save(&Connection{Id: "profile", Name: "before"})
			require.NoError(t, err)
			var handshakeTimedOut bool
			started, resume := make(chan struct{}), make(chan struct{})
			old, replacement := &ConnMock{}, &ConnMock{}
			pool := NewConnPool(repo, func(c *Connection) (*ConnMock, error) {
				if c.Name == "before" {
					close(started)
					select {
					case <-resume:
					case <-time.After(2 * time.Second):
						handshakeTimedOut = true
					}
					return old, nil
				}
				return replacement, nil
			})
			var got *ConnMock
			var dialErr error
			done := make(chan struct{})
			go func() {
				got, dialErr = pool.Get("profile")
				close(done)
			}()
			<-started
			if operation == "reimport" {
				_, err = repo.Save(&Connection{Id: "profile", Name: "after"})
				require.NoError(t, err)
			} else {
				require.NoError(t, repo.Remove("profile"))
			}
			pool.Invalidate("profile")
			close(resume)
			<-done
			require.False(t, handshakeTimedOut, "invalidation waited for the old broker handshake")
			require.True(t, old.closed)
			if operation == "delete" {
				require.Error(t, dialErr)
				require.Nil(t, got)
				return
			}
			require.NoError(t, dialErr)
			require.Same(t, replacement, got)
			warm, err := pool.Get("profile")
			require.NoError(t, err)
			require.Same(t, replacement, warm)
		})
	}
}
