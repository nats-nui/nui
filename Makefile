.PHONY: dev dev-web build docker docker-multiarch docker-run

DOCKER_IMAGE ?= nui
DOCKER_TAG ?= local
VERSION ?= edge-$(shell git rev-parse --short HEAD)
DOCKER_PLATFORMS ?= linux/amd64,linux/arm64

dev:
	wails dev --appargs "--db-path=db --log-output=logs"

dev-web:
	npm --prefix frontend run build && go run cmd/server/main.go --db-path=db --cddl-schemas-path=./tests/cddlschemas/default

build:
	wails build -tags webkit2_41

docker:
	docker buildx build --load \
		--build-arg VERSION=$(VERSION) \
		-t $(DOCKER_IMAGE):$(DOCKER_TAG) .

docker-multiarch:
	docker buildx build \
		--platform $(DOCKER_PLATFORMS) \
		--build-arg VERSION=$(VERSION) \
		-t $(DOCKER_IMAGE):$(DOCKER_TAG) .

docker-run:
	docker run --rm -p 31311:31311 $(DOCKER_IMAGE):$(DOCKER_TAG)
