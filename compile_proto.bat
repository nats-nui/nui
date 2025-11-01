@echo off
REM Compile protobuf definitions for nats-nui testing

echo Compiling protobuf files...

REM Check if protoc is installed
where protoc >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: protoc is not installed. Please install Protocol Buffers compiler.
    echo Visit: https://grpc.io/docs/protoc-installation/
    exit /b 1
)

REM Check if protoc-gen-go is installed
where protoc-gen-go >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: protoc-gen-go is not installed.
    echo Install with: go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
    exit /b 1
)

REM Remove old incorrectly placed files
echo Cleaning up old files...
if exist simple.pb.go del /f simple.pb.go
if exist common\types.pb.go del /f common\types.pb.go
if exist customer\customer.pb.go del /f customer\customer.pb.go
if exist order\order.pb.go del /f order\order.pb.go
if exist proto-schemas\gen\simple\simple.pb.go del /f proto-schemas\gen\simple\simple.pb.go
if exist proto-schemas\gen\common\types.pb.go del /f proto-schemas\gen\common\types.pb.go
if exist proto-schemas\gen\customer\customer.pb.go del /f proto-schemas\gen\customer\customer.pb.go
if exist proto-schemas\gen\order\order.pb.go del /f proto-schemas\gen\order\order.pb.go

REM Create output directories
echo Creating output directories...
if not exist proto-schemas\gen\simple mkdir proto-schemas\gen\simple
if not exist proto-schemas\gen\common mkdir proto-schemas\gen\common
if not exist proto-schemas\gen\customer mkdir proto-schemas\gen\customer
if not exist proto-schemas\gen\order mkdir proto-schemas\gen\order

REM Compile simple.proto
echo Compiling simple.proto...
protoc --go_out=. --go_opt=module=github.com/nats-nui/nui --proto_path=proto-schemas proto-schemas\simple.proto
if %ERRORLEVEL% NEQ 0 (
    echo Error compiling simple.proto
    exit /b 1
)

REM Compile common/types.proto
echo Compiling common/types.proto...
protoc --go_out=. --go_opt=module=github.com/nats-nui/nui --proto_path=proto-schemas proto-schemas\common\types.proto
if %ERRORLEVEL% NEQ 0 (
    echo Error compiling common/types.proto
    exit /b 1
)

REM Compile customer/customer.proto
echo Compiling customer/customer.proto...
protoc --go_out=. --go_opt=module=github.com/nats-nui/nui --proto_path=proto-schemas proto-schemas\customer\customer.proto
if %ERRORLEVEL% NEQ 0 (
    echo Error compiling customer/customer.proto
    exit /b 1
)

REM Compile order/order.proto
echo Compiling order/order.proto...
protoc --go_out=. --go_opt=module=github.com/nats-nui/nui --proto_path=proto-schemas proto-schemas\order\order.proto
if %ERRORLEVEL% NEQ 0 (
    echo Error compiling order/order.proto
    exit /b 1
)

echo.
echo ✓ Protobuf compilation complete!
echo.
echo Generated files:
echo   - proto-schemas\gen\simple\simple.pb.go
echo   - proto-schemas\gen\common\types.pb.go
echo   - proto-schemas\gen\customer\customer.pb.go
echo   - proto-schemas\gen\order\order.pb.go
