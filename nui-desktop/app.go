package main

import (
	"context"
	"flag"
	"fmt"
	"github.com/nats-io/nats.go"
	"github.com/pricelessrabbit/nui/nui"
	"log"
)

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

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	port := flag.String("port", "3111", "port to listen on")
	dbPath := flag.String("db", ":memory:", "path to db")
	flag.Parse()

	nuiSvc, err := nui.Setup(*dbPath)
	if err != nil {
		log.Fatal(err)
	}
	server := nui.NewServer(*port, nuiSvc)
	err = server.Start(ctx)
	if err != nil {
		log.Fatal(err)
	}
}

type Person struct {
	Name    string   `json:"name"`
	Age     uint8    `json:"age"`
	Address *Address `json:"address"`
}

type Address struct {
	Street   string `json:"street"`
	Postcode string `json:"postcode"`
}

func (a *App) Greet(p Person) string {
	return fmt.Sprintf("Hello %s (Age: %d)!", p.Name, p.Age)
}
