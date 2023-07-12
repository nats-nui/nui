package storage

import c "github.com/ostafen/clover"

type DocDb struct {
	s *c.DB
}

func NewDocDb(path string) (*DocDb, error) {
	store, err := c.Open(path)
	if err != nil {
		return nil, err
	}
	return &DocDb{s: store}, nil
}
