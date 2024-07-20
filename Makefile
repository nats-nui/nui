.PHONY: dev dev-web build

dev:
	wails dev --appargs "--db-path=db --log-output=logs"

dev-web:
	npm --prefix frontend run build && go run cmd/server/main.go --db-path=db

build:
	wails build -tags webkit2_41