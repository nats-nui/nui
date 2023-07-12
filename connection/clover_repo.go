package connection

import (
	"github.com/ostafen/clover"
)

type CloverConnRepo struct {
	db *clover.DB
}

func NewCloverConnRepo(db *clover.DB) *CloverConnRepo {
	return &CloverConnRepo{
		db: db,
	}
}
