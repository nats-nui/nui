package main

import (
	"embed"
	"github.com/pricelessrabbit/nui/desktop"
	"github.com/pricelessrabbit/nui/desktop/mapping"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist-app
var assets embed.FS

func main() {
	// Create an instance of the app structure
	app := desktop.NewApp()

	// Create application with options
	err := wails.Run(&options.App{
		Title:  "NUI",
		Width:  1024,
		Height: 768,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup:        app.Startup,
		Bind: []interface{}{
			&mapping.Api{},
		},
	})
	if err != nil {
		println("Error:", err.Error())
	}
}
