package ws

import "github.com/nats-io/nats.go"

type ClientSub[S Subscription] struct {
	Subject  string
	Messages chan *nats.Msg
	Sub      S
}

func NewClientSub[S Subscription](subject string) ClientSub[S] {
	return ClientSub[S]{
		Subject:  subject,
		Messages: make(chan *nats.Msg, 10),
	}
}
