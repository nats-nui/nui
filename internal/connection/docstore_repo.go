package connection

import (
	"errors"
	docstore "github.com/nats-nui/nui/pkg/storage"
	"github.com/ostafen/clover/v2/document"
	"github.com/ostafen/clover/v2/query"
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
	docs, err := r.db.FindAll(query.NewQuery(docstore.CONN_COLLECTION))
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
	doc, err := r.db.FindById(docstore.CONN_COLLECTION, id)
	if err != nil {
		return nil, err
	}
	if doc == nil {
		return nil, errors.New("record not found")
	}
	conn, err := unmarshalDoc(doc)
	if err != nil {
		return nil, err
	}
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
	doc.Set("_id", c.Id)
	err := r.db.ReplaceById(docstore.CONN_COLLECTION, c.Id, doc)
	if err != nil {
		return nil, err
	}
	return r.GetById(c.Id)
}

func (r *DocStoreConnRepo) Remove(id string) error {
	return r.db.DeleteById(docstore.CONN_COLLECTION, id)
}

func unmarshalDoc(doc *document.Document) (*Connection, error) {
	conn := &Connection{}
	err := doc.Unmarshal(conn)
	if err != nil {
		return nil, err
	}
	conn.Id = doc.ObjectId()
	return conn, nil
}
