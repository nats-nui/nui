package connection

import (
	"github.com/stretchr/testify/require"
	"testing"
)

type repoSuite struct {
	c1    *Connection
	c2    *Connection
	mRepo *MemConnRepo
}

func setupRepoSuite() *repoSuite {
	s := &repoSuite{}
	s.c1 = &Connection{
		Id:    "id1",
		Name:  "c1",
		Hosts: []string{"localhost:4222"},
	}
	s.c2 = &Connection{
		Id:    "id2",
		Name:  "c2",
		Hosts: []string{"localhost:4222"},
	}
	s.mRepo = NewMemConnRepo()
	return s
}

func TestMemConnRepo_Save(t *testing.T) {
	s := setupRepoSuite()
	err := s.mRepo.Save(s.c1)
	require.Nil(t, err)
}

func TestMemConnRepo_GetById(t *testing.T) {
	s := setupRepoSuite()
	_ = s.mRepo.Save(s.c1)
	retrieved, err := s.mRepo.GetById("id1")
	require.Nil(t, err)
	require.Equal(t, *s.c1, *retrieved)
}

func TestMemConnRepo_All(t *testing.T) {
	s := setupRepoSuite()
	_ = s.mRepo.Save(s.c1)
	_ = s.mRepo.Save(s.c2)
	conns := s.mRepo.All()
	require.Equal(t, 2, len(conns))
	require.Equal(t, *s.c1, *conns["id1"])
	require.Equal(t, *s.c2, *conns["id2"])
}
