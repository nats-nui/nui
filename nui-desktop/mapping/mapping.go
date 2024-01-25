package mapping

import (
	"github.com/nats-io/nats.go"
)

type StreamApi struct {
	StreamInfo   *nats.StreamInfo   `json:"streamInfo"`
	StreamConfig *nats.StreamConfig `json:"streamConfig"`
	Consumer     *nats.ConsumerInfo `json:"consumer"`
}

type Api struct {
	StreamApi *StreamApi `json:"streamApi"`
}

func (a *Api) BindApi() Api {
	return Api{}
}
