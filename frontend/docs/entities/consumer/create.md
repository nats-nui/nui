# Create Consumer

Creates a new consumer for a given stream.

## Request
- **Method:** POST
- **Endpoint:** `/api/connection/{connection_id}/stream/{stream_name}/consumer`
- **Body:**
  - Consumer configuration (see NATS JetStream docs)

## Example
```typescript
consumer config
```
[CONSUMER-CONFIG](./def/consumer-config.md)

## Response
- **200 OK**: Consumer created successfully (returns consumer info)
- **422 Unprocessable Entity**: Validation error

