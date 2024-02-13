package desktop

import (
	"context"
	"flag"
	"github.com/pricelessrabbit/nui/internal/nui"
	"log"
	"log/slog"
	"os"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// Startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) Startup(ctx context.Context) {
	a.ctx = ctx
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
	server := nui.NewServer(*port, nuiSvc, logger)
	err = server.Start(ctx)
	if err != nil {
		log.Fatal(err)
	}
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
