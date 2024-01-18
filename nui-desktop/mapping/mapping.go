package mapping

import "github.com/nats-io/nats.go"

type StreamApi struct {
	StreamInfo   *nats.StreamInfo   `json:"streamInfo"`
	StreamConfig *nats.StreamConfig `json:"streamConfig"`
}

type Api struct {
	StreamApi *StreamApi `json:"streamApi"`
}

func (a *Api) BindApi() Api {
	return Api{}
}
