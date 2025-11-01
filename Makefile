.PHONY: dev dev-web build proto clean-proto

dev:
	wails dev --appargs "--db-path=db --log-output=logs"

dev-web:
	npm --prefix frontend run build && go run cmd/server/main.go --db-path=db

build:
	wails build -tags webkit2_41

clean-proto:
	@echo "Cleaning up old/bad protobuf files..."
	@rm -f simple.pb.go common/types.pb.go customer/customer.pb.go order/order.pb.go
	@rm -f proto-schemas/gen/simple/*.pb.go
	@rm -f proto-schemas/gen/common/*.pb.go
	@rm -f proto-schemas/gen/customer/*.pb.go
	@rm -f proto-schemas/gen/order/*.pb.go
	@echo "Cleanup complete!"

proto: clean-proto
	@echo "Compiling protobuf files..."
	@mkdir -p proto-schemas/gen/simple proto-schemas/gen/common proto-schemas/gen/customer proto-schemas/gen/order
	@echo "Compiling simple.proto..."
	protoc --go_out=. --go_opt=module=github.com/nats-nui/nui \
		--proto_path=proto-schemas \
		proto-schemas/simple.proto
	@echo "Compiling common/types.proto..."
	protoc --go_out=. --go_opt=module=github.com/nats-nui/nui \
		--proto_path=proto-schemas \
		proto-schemas/common/types.proto
	@echo "Compiling customer/customer.proto..."
	protoc --go_out=. --go_opt=module=github.com/nats-nui/nui \
		--proto_path=proto-schemas \
		proto-schemas/customer/customer.proto
	@echo "Compiling order/order.proto..."
	protoc --go_out=. --go_opt=module=github.com/nats-nui/nui \
		--proto_path=proto-schemas \
		proto-schemas/order/order.proto
	@echo "✓ Protobuf compilation complete!"
	@echo "Generated files in proto-schemas/gen/"
