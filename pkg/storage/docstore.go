package docstore

import c "github.com/ostafen/clover"

const CONN_COLLECTION = "connections"

type DB struct {
	*c.DB
}

func NewDocDb(path string) (*DB, error) {
	store, err := c.Open(path)
	if err != nil {
		return nil, err
	}
	err = createCollection(store, CONN_COLLECTION)
	if err != nil {
		return nil, err
	}
	return &DB{DB: store}, nil
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
