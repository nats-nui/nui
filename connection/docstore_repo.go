package connection

import (
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
