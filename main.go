package main

import (
	"context"
	"fmt"
	"github.com/pricelessrabbit/nui/connection"
	"github.com/pricelessrabbit/nui/ws"
	"log"
	"time"
)

func main() {
	repo := connection.NewMemConnRepo()
	err := repo.Save(&connection.Connection{
		Id:    "conn1",
		Hosts: []string{"nats://localhost:4222"},
	})
	if err != nil {
		log.Fatal(err)
	}
	pool := connection.NewNatsConnPool(repo)
	hub := ws.NewNatsHub(pool)

	reqCh := make(chan ws.Request, 1)
	msgCh := make(chan *ws.Message, 5)
	errCh := make(chan error, 1)
	ctx, _ := context.WithCancel(context.Background())
	hub.Register(ctx, "client1", reqCh, msgCh, errCh)

	go func() {
		for {
			select {
			case <-ctx.Done():
				return
			case msg := <-msgCh:
				log.Println(msg.Subject)
				log.Println(msg.Payload)
			case err := <-errCh:
				log.Println(err)
			}
		}
	}()

	i := 0
	reqCh <- ws.Request{
		ConnectionId: "conn1",
		Subjects:     []string{fmt.Sprintf("subject_%d", i) + ".>"},
	}
	for range time.Tick(5 * time.Second) {
		i++
		reqCh <- ws.Request{
			ConnectionId: "conn1",
			Subjects:     []string{fmt.Sprintf("subject_%d", i) + ".>"},
		}
	}
}
