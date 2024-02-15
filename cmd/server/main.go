package main

import (
	"context"
	"flag"
	"github.com/pricelessrabbit/nui/internal/app"
	"github.com/pricelessrabbit/nui/pkg/logging"
	"os"
	"os/signal"
	"syscall"
)

func main() {

	logLevel := flag.String("log-level", "info", "log level")
	logOutput := flag.String("log-output", "", "log output")
	dbPath := flag.String("db-path", ":memory:", "path to the database")

	flag.Parse()

	logger := logging.NewSlogger(*logLevel, *logOutput)
	ctx, cancel := context.WithCancel(context.Background())

	webApp, err := app.NewApp(
		app.WithTarget(app.TargetWeb),
		app.WithDb(*dbPath),
		app.WithLogger(logger),
	)
	if err != nil {
		logger.Error(err.Error())
		os.Exit(1)
	}

	go func() {
		webApp.Startup(ctx)
	}()

	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)
	go func() {
		sig := <-sigCh
		logger.Info("Shutting down...", sig)
		cancel()
	}()
	<-ctx.Done()
}
