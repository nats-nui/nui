## be build
FROM golang:1.23 AS build_be
ARG VERSION
WORKDIR /src
COPY . .
RUN  go build -ldflags "-X main.Version=$VERSION" -o /cmd/nui-web ./cmd/server/main.go

## frontend build
FROM --platform=$BUILDPLATFORM node:18 AS build_fe
WORKDIR /frontend
COPY ./frontend .
RUN npm install
RUN npm run build

### production image
FROM alpine:3
WORKDIR /
# Install deps
RUN apk add libc6-compat

# Create regular NUI user account
RUN addgroup -g 1001 nui && \
    adduser -u 1001 -D nui -G nui -s /bin/sh

# Copy the needed binary from the builder stage
COPY --from=build_be /cmd/nui-web /cmd/nui-web
COPY --from=build_fe /frontend/dist /frontend/dist
RUN chown -R nui:nui /cmd/nui-web /frontend

COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 31311/tcp
ENTRYPOINT ["/entrypoint.sh"]