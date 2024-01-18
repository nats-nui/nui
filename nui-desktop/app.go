package main

import (
	"context"
	"flag"
	"github.com/pricelessrabbit/nui/nui"
	"log"
)

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
