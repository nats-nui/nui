package connection

type ConnRepo interface {
	All() (map[string]*Connection, error)
	GetById(id string) (*Connection, error)
	Save(c *Connection) (*Connection, error)
	Remove(id string) error
}
