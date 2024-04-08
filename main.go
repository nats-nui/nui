package main

import (
	"embed"
	"flag"
	"github.com/gofiber/fiber/v2/log"
	"github.com/nats-nui/nui/desktop/mapping"
	"github.com/nats-nui/nui/internal/app"
	"github.com/nats-nui/nui/pkg/logging"
	"github.com/nats-nui/nui/pkg/ospaths"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/linux"
	"github.com/wailsapp/wails/v2/pkg/options/mac"
	"os"
)

//go:embed all:frontend/dist-app
var assets embed.FS

//go:embed build/appicon.png
var icon []byte

var Version string

func main() {

	logLevel := *flag.String("log-level", "info", "log level")
	logsOutput := *flag.String("log-output", "", "log output")
	dbPath := *flag.String("db-path", "", "path to the database")

	if logsOutput == "" {
		lo, err := ospaths.LogsPath()
		if err != nil {
			log.Fatal("error getting logs path: " + err.Error())
		}
		logsOutput = lo
	}

	if dbPath == "" {
		dbp, err := ospaths.DbPath()
		if err != nil {
			log.Fatal("error getting db path: " + err.Error())
		}
		dbPath = dbp
	}

	logger, err := logging.NewSlogger(logLevel, logsOutput)
	if err != nil {
		log.Fatal("error creating logger: " + err.Error())
	}

	// Create an instance of the app structure
	desktopApp, err := app.NewApp(
		app.WithTarget(app.TargetDesktop),
		app.WithVersion(Version),
		app.WithDb(dbPath),
		app.WithLogger(logger),
	)
	if err != nil {
		logger.Error(err.Error())
		os.Exit(1)
	}
	// Create application with options
	err = wails.Run(&options.App{
		Title:            "NUI",
		WindowStartState: options.Maximised,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup:        desktopApp.Startup,
		Bind: []interface{}{
			&mapping.Api{},
		},
		Linux: &linux.Options{
			Icon: icon,
		},
		Mac: &mac.Options{
			About: &mac.AboutInfo{
				Title: "NUI",
				Icon:  icon,
			},
		},
	})
	if err != nil {
		logger.Error(err.Error())
	}
}
