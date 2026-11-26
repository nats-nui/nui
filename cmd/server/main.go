package main

import (
	"context"
	"flag"
	"os"
	"os/signal"
	"syscall"

	"github.com/gofiber/fiber/v2/log"
	"github.com/nats-nui/nui/internal/app"
	"github.com/nats-nui/nui/internal/version"
	"github.com/nats-nui/nui/pkg/clicontext"
	"github.com/nats-nui/nui/pkg/logging"
)

var Version string

func main() {

	version.Set(Version)

	logLevel := flag.String("log-level", "info", "log level")
	logOutput := flag.String("log-output", "", "log output")
	dbPath := flag.String("db-path", ":memory:", "path to the database")
	protoSchemasPath := flag.String("proto-schemas-path", "./protoschemas/default", "path to the protobuf schemas directory")
	cddlSchemasPath := flag.String("cddl-schemas-path", "./cddlschemas/default", "path to the CDDL schemas directory")
	cliContextsStr := flag.String("nats-cli-contexts", "./clicontexts", "path to the CLI contexts dirs to load at startup. Multiple paths can be separated by a comma.")

	flag.Parse()
	logger, err := logging.NewSlogger(*logLevel, *logOutput)
	if err != nil {
		log.Fatal(err.Error())
	}

	logger.Info("Starting up...")

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	webApp, err := app.NewApp(
		app.WithTarget(app.TargetWeb),
		app.WithVersion(Version),
		app.WithDb(*dbPath),
		app.WithProtoSchemasPath(*protoSchemasPath),
		app.WithCddlSchemasPath(*cddlSchemasPath),
		app.WithLogger(logger),
		app.WithNatsCliContexts(clicontext.SanitizePaths(*cliContextsStr)),
	)
	if err != nil {
		logger.Error(err.Error())
		os.Exit(1)
	}

	webApp.Startup(ctx)
	<-ctx.Done()
	stop() // Restore the default signal handler while waiting for the server.
	webApp.Shutdown()
}
