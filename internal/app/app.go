package app

import (
	"context"
	"errors"
	"os"
	"sync"
	"time"

	"github.com/nats-nui/nui/internal/nui"
	"github.com/nats-nui/nui/pkg/logging"
)

// App struct
type App struct {
	once               sync.Once
	cancel             context.CancelFunc
	done               chan struct{}
	version            string
	target             Target
	l                  logging.Slogger
	dbPath             string
	protoschemasPath   string
	cddlschemasPath    string
	serverPort         string
	natsCliContextDirs []string
}

// NewApp creates a new App application struct
func NewApp(opts ...AppOption) (*App, error) {
	app := &App{
		target:           TargetDesktop,
		l:                &logging.NullLogger{},
		dbPath:           ":memory:",
		protoschemasPath: "",
		cddlschemasPath:  "",
		serverPort:       "31311",
	}
	for _, o := range opts {
		o(app)
	}
	if app.target == "" {
		return nil, errors.New("app target empty")
	}
	if app.l == nil {
		return nil, errors.New("app logger required")
	}
	return app, nil
}

// Startup starts the backend when the web or desktop frontend is ready.
func (a *App) Startup(ctx context.Context) {
	a.start(ctx, a.run)
}

func (a *App) start(ctx context.Context, run func(context.Context)) {
	a.once.Do(func() {
		ctx, a.cancel = context.WithCancel(ctx)
		a.done = make(chan struct{})
		go func() {
			defer close(a.done)
			if ctx.Err() == nil {
				run(ctx)
			}
		}()
	})
}

func (a *App) Shutdown() {
	a.once.Do(func() {}) // Wails can exit before its startup callback runs.
	if a.cancel == nil {
		return
	}
	a.l.Info("Shutting down...")
	a.cancel()
	select {
	case <-a.done:
	case <-time.After(nui.ShutdownTimeout):
		a.l.Warn("Timed out waiting for backend shutdown")
	}
}

func (a *App) run(ctx context.Context) {

	a.l.Info("Starting nui app...")
	a.l.Info("Version: " + a.version)
	a.l.Info("database path: " + a.dbPath)

	nuiSvc, err := nui.Setup(a.dbPath, a.protoschemasPath, a.cddlschemasPath, a.l)
	if err != nil {
		a.l.Error("fatal error setting up app nui service: " + err.Error())
		os.Exit(1)
	}
	server := nui.NewServer(a.serverPort, nuiSvc, a.l, a.target == TargetDesktop)

	if len(a.natsCliContextDirs) > 0 {
		for _, path := range a.natsCliContextDirs {
			a.l.Info("importing cli contexts from path: " + path)
			response, err := server.ImportCliContextsFromPath(ctx, path)
			if err != nil {
				a.l.Error("error importing cli contexts from path: " + path + " - " + err.Error())
			}
			// log all imported connection names
			for _, conn := range response.Connections {
				a.l.Info("imported connection: " + conn.Name)
			}
		}
	}

	err = server.Start(ctx)
	if err != nil {
		if ctx.Err() != nil {
			a.l.Warn("error shutting down HTTP server", "error", err)
			return
		}
		a.l.Error("fatal error setting up app webserver: " + err.Error())
		os.Exit(1)
	}
}
