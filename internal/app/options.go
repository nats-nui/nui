package app

import (
	"github.com/pricelessrabbit/nui/pkg/logging"
)

type AppOption func(a *App)

func WithLogger(l logging.Slogger) AppOption {
	return func(a *App) {
		a.l = l
	}
}

type Target string

const TargetDesktop = Target("desktop")
const TargetWeb = Target("web")

func WithTarget(t Target) AppOption {
	return func(a *App) {
		a.target = t
	}
}
func WithMemoryDb() AppOption {
	return func(a *App) {
		a.dbPath = ":memory:"
	}
}
func WithDb(path string) AppOption {
	return func(a *App) {
		a.dbPath = path
	}
}
