package main

import (
	"context"
	"flag"
	"github.com/gofiber/fiber/v2/log"
	"github.com/nats-nui/nui/internal/app"
	"github.com/nats-nui/nui/internal/version"
	"github.com/nats-nui/nui/pkg/logging"
	"os"
	"os/signal"
	"syscall"
)

var Version string

func main() {

	version.Set(Version)

	logLevel := flag.String("log-level", "info", "log level")
	logOutput := flag.String("log-output", "", "log output")
	dbPath := flag.String("db-path", ":memory:", "path to the database")

	flag.Parse()
	logger, err := logging.NewSlogger(*logLevel, *logOutput)
	if err != nil {
		log.Fatal(err.Error())
	}

	logger.Info("Starting up...")

	ctx, cancel := context.WithCancel(context.Background())
	webApp, err := app.NewApp(
		app.WithTarget(app.TargetWeb),
		app.WithVersion(Version),
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
		logger.Info("Shutting down...", "signal", sig.String())
		cancel()
	}()
	<-ctx.Done()
}
