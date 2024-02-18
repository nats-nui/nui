package logging

import (
	"io"
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

func NewSlogger(logLevel, output string) (*slog.Logger, error) {
	w, err := openLogWriter(output)
	if err != nil {
		return nil, err
	}
	return slog.New(slog.NewJSONHandler(w, &slog.HandlerOptions{Level: parseLogLevel(logLevel)})), nil
}
func openLogWriter(output string) (io.Writer, error) {
	if output != "" {
		w, err := os.OpenFile(output, os.O_APPEND|os.O_CREATE|os.O_RDWR, 0644)
		if err != nil {
			return nil, err
		}
		return w, nil
	}
	return os.Stdout, nil
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
