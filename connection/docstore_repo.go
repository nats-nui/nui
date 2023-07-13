package connection

import (
	"errors"
	c "github.com/ostafen/clover"
	docstore "github.com/pricelessrabbit/nui/pkg/storage"
)

type DocStoreConnRepo struct {
	db *docstore.DB
}

func NewDocStoreConnRepo(db *docstore.DB) *DocStoreConnRepo {
	return &DocStoreConnRepo{
		db: db,
	}
}

func (r *DocStoreConnRepo) All() (map[string]*Connection, error) {
	docs, err := r.db.Query(docstore.CONN_COLLECTION).FindAll()
	if err != nil {
		return nil, err
	}
	conns := make(map[string]*Connection)
	for _, doc := range docs {
		conn, err := unmarshalDoc(doc)
		if err != nil {
			return nil, err
		}
		conns[conn.Id] = conn
	}
	return conns, nil
}

func (r *DocStoreConnRepo) GetById(id string) (*Connection, error) {
	doc, err := r.db.Query(docstore.CONN_COLLECTION).FindById(id)
	if err != nil {
		return nil, err
	}
	if doc == nil {
		return nil, errors.New("record not found")
	}
	conn := &Connection{}
	err = doc.Unmarshal(conn)
	if err != nil {
		return nil, err
	}
	conn.Id = doc.ObjectId()
	return conn, nil
}

func (r *DocStoreConnRepo) Save(c *Connection) (*Connection, error) {
	if c.Id == "" {
		doc := r.db.DocFromType(c)
		id, err := r.db.InsertOne(docstore.CONN_COLLECTION, doc)
		if err != nil {
			return nil, err
		}
		c.Id = id
		return c, nil
	}
	doc := r.db.DocFromType(c)
	err := r.db.Query(docstore.CONN_COLLECTION).ReplaceById(c.Id, doc)
	if err != nil {
		return nil, err
	}
	return c, nil
}

func (r *DocStoreConnRepo) Remove(id string) error {
	return r.db.Query(docstore.CONN_COLLECTION).DeleteById(id)
}

func unmarshalDoc(doc *c.Document) (*Connection, error) {
	conn := &Connection{}
	err := doc.Unmarshal(conn)
	if err != nil {
		return nil, err
	}
	conn.Id = doc.ObjectId()
	return conn, nil
}
