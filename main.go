package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
)

func main() {

	nui := NewNui()
	server := NewServer("3111", nui)
	ctx, cancel := context.WithCancel(context.Background())
	err := server.Start(ctx)
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
