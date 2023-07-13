package docstore

import (
	c "github.com/ostafen/clover"
)

const CONN_COLLECTION = "connections"

type DB struct {
	*c.DB
}

func NewDocStore(path string) (*DB, error) {
	var opts []c.Option
	if path == "" || path == ":memory:" {
		path = ""
		opts = append(opts, c.InMemoryMode(true))
	}
	store, err := c.Open(path, opts...)
	if err != nil {
		return nil, err
	}
	err = createCollection(store, CONN_COLLECTION)
	if err != nil {
		return nil, err
	}
	return &DB{DB: store}, nil
}

func (d *DB) DocFromType(obj any) *c.Document {
	return c.NewDocumentOf(obj)
}

func createCollection(db *c.DB, name string) error {
	ok, err := db.HasCollection(name)
	if err != nil {
		return err
	}
	if ok {
		return nil
	}
	return db.CreateCollection(name)
}
