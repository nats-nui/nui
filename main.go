package main

import (
	"embed"
	"flag"
	"fmt"
	"os"

	"github.com/gofiber/fiber/v2/log"
	"github.com/nats-nui/nui/desktop/mapping"
	"github.com/nats-nui/nui/internal/app"
	"github.com/nats-nui/nui/internal/version"
	"github.com/nats-nui/nui/pkg/clicontext"
	"github.com/nats-nui/nui/pkg/logging"
	"github.com/nats-nui/nui/pkg/ospaths"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/linux"
	"github.com/wailsapp/wails/v2/pkg/options/mac"
)

//go:embed all:frontend/dist-app
var assets embed.FS

//go:embed build/appicon.png
var icon []byte

var Version string

func main() {

	version.Set(Version)

	var logLevel string
	var logsOutput string
	var dbPath string
	var protoSchemasPath string
	var cliContextsStr string

	flag.StringVar(&logLevel, "log-level", "info", "log level")
	flag.StringVar(&logsOutput, "log-output", "", "log output")
	flag.StringVar(&dbPath, "db-path", "", "path to the database")
	flag.StringVar(&protoSchemasPath, "proto-schemas-path", "", "path to the protobuf schemas directory")
	flag.StringVar(&cliContextsStr, "nats-cli-contexts", "", "path to the CLI contexts dirs to load at startup. Multiple paths can be separated by a comma.")

	flag.Parse()

	if logsOutput == "" {
		lo, err := ospaths.LogsPath()
		if err != nil {
			log.Fatal("error getting logs path: " + err.Error())
		}
		logsOutput = lo
	}

	fmt.Print("dbpath " + dbPath)
	if dbPath == "" {
		dbp, err := ospaths.DbPath()
		if err != nil {
			log.Fatal("error getting db path: " + err.Error())
		}
		dbPath = dbp
	}

	if protoSchemasPath == "" {
		psp, err := ospaths.ProtoSchemasPath()
		if err != nil {
			log.Fatal("error getting proto schemas path: " + err.Error())
		}
		protoSchemasPath = psp
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
		app.WithProtoSchemasPath(protoSchemasPath),
		app.WithLogger(logger),
		app.WithNatsCliContexts(clicontext.SanitizePaths(cliContextsStr)),
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
