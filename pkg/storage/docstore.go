package docstore

import (
	"github.com/dgraph-io/badger/v4"
	c "github.com/ostafen/clover/v2"
	"github.com/ostafen/clover/v2/document"
	badgerstore "github.com/ostafen/clover/v2/store/badger"
)

const CONN_COLLECTION = "connections"

type DB struct {
	*c.DB
}

func NewDocStore(path string) (*DB, error) {

	opts := badger.DefaultOptions(path)
	if path == "" || path == ":memory:" {
		opts = badger.DefaultOptions("").WithInMemory(true)
	}
	store, err := badgerstore.OpenWithOptions(opts)
	if err != nil {
		return nil, err
	}
	// opens a badger in memory database
	db, _ := c.OpenWithStore(store)
	if err != nil {
		return nil, err
	}
	err = createCollection(db, CONN_COLLECTION)
	if err != nil {
		return nil, err
	}
	return &DB{DB: db}, nil
}

func (d *DB) DocFromType(obj any) *document.Document {
	return document.NewDocumentOf(obj)
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
