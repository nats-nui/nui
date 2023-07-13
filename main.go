package main

import (
	"context"
	"flag"
	"log"
	"os"
	"os/signal"
	"syscall"
)

func main() {
	port := flag.String("port", "3111", "port to listen on")
	dbPath := flag.String("db", ":memory:", "path to db")
	flag.Parse()

	nui, err := Setup(*dbPath)
	if err != nil {
		log.Fatal(err)
	}
	server := NewServer(*port, nui)
	ctx, cancel := context.WithCancel(context.Background())
	err = server.Start(ctx)
	if err != nil {
		log.Fatal(err)
	}

	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)
	go func() {
		sig := <-sigCh
		log.Println("Shutting down", sig)
		cancel()
	}()
	<-ctx.Done()
}
