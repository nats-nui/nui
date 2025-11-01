#!/bin/bash

# Compile protobuf definitions for nats-nui testing

set -e

echo "Compiling protobuf files..."

# Check if protoc is installed
if ! command -v protoc &> /dev/null; then
    echo "Error: protoc is not installed. Please install Protocol Buffers compiler."
    echo "Visit: https://grpc.io/docs/protoc-installation/"
    exit 1
fi

# Check if protoc-gen-go is installed
if ! command -v protoc-gen-go &> /dev/null; then
    echo "Error: protoc-gen-go is not installed."
    echo "Install with: go install google.golang.org/protobuf/cmd/protoc-gen-go@latest"
    exit 1
fi

# Clean up old/bad files
echo "Cleaning up old files..."
rm -f simple.pb.go common/types.pb.go customer/customer.pb.go order/order.pb.go
rm -f proto-schemas/gen/simple/*.pb.go
rm -f proto-schemas/gen/common/*.pb.go
rm -f proto-schemas/gen/customer/*.pb.go
rm -f proto-schemas/gen/order/*.pb.go

# Create output directories
mkdir -p proto-schemas/gen/simple
mkdir -p proto-schemas/gen/common
mkdir -p proto-schemas/gen/customer
mkdir -p proto-schemas/gen/order

# Compile simple.proto
echo "Compiling simple.proto..."
protoc --go_out=. --go_opt=module=github.com/nats-nui/nui \
    --proto_path=proto-schemas \
    proto-schemas/simple.proto

# Compile common/types.proto
echo "Compiling common/types.proto..."
protoc --go_out=. --go_opt=module=github.com/nats-nui/nui \
    --proto_path=proto-schemas \
    proto-schemas/common/types.proto

# Compile customer/customer.proto
echo "Compiling customer/customer.proto..."
protoc --go_out=. --go_opt=module=github.com/nats-nui/nui \
    --proto_path=proto-schemas \
    proto-schemas/customer/customer.proto

# Compile order/order.proto
echo "Compiling order/order.proto..."
protoc --go_out=. --go_opt=module=github.com/nats-nui/nui \
    --proto_path=proto-schemas \
    proto-schemas/order/order.proto

echo ""
echo "✓ Protobuf compilation complete!"
echo ""
echo "Generated files:"
echo "  - proto-schemas/gen/simple/simple.pb.go"
echo "  - proto-schemas/gen/common/types.pb.go"
echo "  - proto-schemas/gen/customer/customer.pb.go"
echo "  - proto-schemas/gen/order/order.pb.go"
