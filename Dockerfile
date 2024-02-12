
FROM golang:1.21 AS build_be
WORKDIR /src
COPY . .
RUN  go build -o /cmd/nui-web ./cmd/server/main.go

## frontend build
FROM node:18 AS build_fe
WORKDIR /frontend
COPY ./frontend .
RUN npm install
RUN npm run build

### production image
FROM golang:1.21
WORKDIR /
COPY --from=build_be /cmd/nui-web /cmd/nui-web
COPY --from=build_fe /frontend/dist /frontend/dist
EXPOSE 3111/tcp
ENTRYPOINT ["/cmd/nui-web"]