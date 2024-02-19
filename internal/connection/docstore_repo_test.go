package connection

import (
	docstore "github.com/nats-nui/nui/pkg/storage"
	"github.com/stretchr/testify/require"
	"testing"
)

type docRepoSuite struct {
	c1   *Connection
	c2   *Connection
	repo *DocStoreConnRepo
}

func setupDocRepoSuite(t *testing.T) *docRepoSuite {
	s := &docRepoSuite{}
	s.c1 = &Connection{
		Name:          "c1",
		Hosts:         []string{"localhost:4222"},
		Subscriptions: make([]Subscription, 0),
		Auth:          make([]Auth, 0),
	}
	s.c2 = &Connection{
		Name:          "c2",
		Hosts:         []string{"localhost:4222"},
		Subscriptions: []Subscription{},
		Auth:          make([]Auth, 0),
	}
	store, err := docstore.NewDocStore(":memory:")
	if err != nil {
		t.Fatal(err)
	}
	s.repo = NewDocStoreConnRepo(store)
	return s
}

func TestDocConnRepo_Save(t *testing.T) {
	s := setupDocRepoSuite(t)
	_, err := s.repo.Save(s.c1)
	require.Nil(t, err)
}

func TestDocConnRepo_GetById(t *testing.T) {
	s := setupDocRepoSuite(t)
	c1, _ := s.repo.Save(s.c1)
	retrieved, err := s.repo.GetById(c1.Id)
	require.Nil(t, err)
	require.Equal(t, *s.c1, *retrieved)
}

func TestDocConnRepo_All(t *testing.T) {
	s := setupDocRepoSuite(t)
	c1, _ := s.repo.Save(s.c1)
	c2, _ := s.repo.Save(s.c2)
	conns, _ := s.repo.All()
	require.Equal(t, 2, len(conns))
	require.Equal(t, *s.c1, *conns[c1.Id])
	require.Equal(t, *s.c2, *conns[c2.Id])
}
