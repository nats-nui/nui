package logging

import (
	"log/slog"
	"os"
)

type Slogger interface {
	Debug(msg string, args ...any)
	Info(msg string, args ...any)
	Warn(msg string, args ...any)
	Error(msg string, args ...any)
}

type NullLogger struct{}

func (m *NullLogger) Debug(msg string, args ...any) {}
func (m *NullLogger) Info(msg string, args ...any)  {}
func (m *NullLogger) Warn(msg string, args ...any)  {}
func (m *NullLogger) Error(msg string, args ...any) {}

func NewSlogger(logLevel, output string) *slog.Logger {
	return slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: parseLogLevel(logLevel)}))
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
