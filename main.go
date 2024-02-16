package main

import (
	"embed"
	"flag"
	"github.com/gofiber/fiber/v2/log"
	"github.com/pricelessrabbit/nui/desktop/mapping"
	"github.com/pricelessrabbit/nui/internal/app"
	"github.com/pricelessrabbit/nui/pkg/logging"
	"github.com/pricelessrabbit/nui/pkg/ospaths"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"os"
)

//go:embed all:frontend/dist-app
var assets embed.FS

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
		app.WithDb(dbPath),
		app.WithLogger(logger),
	)
	if err != nil {
		logger.Error(err.Error())
		os.Exit(1)
	}
	// Create application with options
	err = wails.Run(&options.App{
		Title:  "NUI",
		Width:  1024,
		Height: 768,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup:        desktopApp.Startup,
		Bind: []interface{}{
			&mapping.Api{},
		},
	})
	if err != nil {
		logger.Error(err.Error())
	}
}
