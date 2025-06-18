# WebSocket Protocol

This document describes the generic WebSocket message format and error handling used throughout the API.

## Message Wrapper

All messages sent to and from the server are wrapped in the following structure:

```typescript
{
  "type": string,
  "payload": any // based on type
}
```

## Error Message

Error messages follow this format:

```typescript
{
  "type": "error",
  "error": string
}
```

---

## Protocols

- [Connection WebSocket](./connection.md)
- [Metrics WebSocket](./metrics.md)

