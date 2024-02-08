package main

import (
	"context"
	"flag"
	"github.com/pricelessrabbit/nui/nui"
	"log"
	"log/slog"
	"os"
	"os/signal"
	"syscall"
)

func main() {
	port := flag.String("port", "3111", "port to listen on")
	dbPath := flag.String("db", ":memory:", "path to db")
	logLevel := flag.String("log-level", "info", "log level")
	flag.Parse()

	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: parseLogLevel(*logLevel)}))
	logger.Info("Starting nui")
	nuiSvc, err := nui.Setup(*dbPath, logger)
	if err != nil {
		log.Fatal(err)
	}

	logger.Info("Starting web-server")
	server := nui.NewServer(*port, nuiSvc, logger)
	ctx, cancel := context.WithCancel(context.Background())
	err = server.Start(ctx)
	if err != nil {
		log.Fatal(err)
	}
	logger.Info("Nui started")

	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)
	go func() {
		sig := <-sigCh
		logger.Info("Shutting down", sig)
		cancel()
	}()
	<-ctx.Done()
}

func parseLogLevel(level string) slog.Level {
	switch level {
	case "debug":
		return slog.LevelDebug
	case "info":
		return slog.LevelInfo
	case "warn":
		return slog.LevelWarn
	case "error":
		return slog.LevelError
	default:
		return slog.LevelInfo
	}
}
