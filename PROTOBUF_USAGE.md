# Protobuf Message Decoding - Quick Guide

Decode binary protobuf messages in NATS UI using your own schemas.

## Setup

1. **Add your .proto files** to the `proto-schemas/` directory:
```
nui/
├── proto-schemas/
│   ├── user_events.proto
│   ├── order.proto
│   └── common/
│       └── types.proto
```

2. **Example schema**:
```protobuf
// proto-schemas/user_events.proto
syntax = "proto3";

message UserCreated {
  string user_id = 1;
  string email = 2;
  int64 created_at = 3;
}
```

## Usage

1. **View a binary message** in NATS UI
2. **Select "Protobuf" formatter** from dropdown
3. **System auto-detects** schema and message type
4. **See decoded JSON data**

If auto-detection fails, manually select schema and message type.

## Smart Features

- **Topic pattern learning**: `user.123.events.created` → learns `user.*.events.created`
- **Persistent caching**: Remembers successful combinations
- **Import resolution**: Automatically handles schema dependencies
- **Google types included**: Common types like `google.protobuf.Timestamp`, `Any`, `Duration` work out of the box

## Troubleshooting

- **No decode**: Check if .proto files are in `proto-schemas/` directory
- **Import errors**: Verify import paths relative to `proto-schemas/`
- **Wrong data**: Try manual schema selection

That's it! The system handles the complexity automatically.