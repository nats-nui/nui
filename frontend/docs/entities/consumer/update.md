# Update Consumer

Updates an existing consumer's configuration.

## Request
- **Method:** POST
- **Endpoint:** `/api/connection/{connection_id}/stream/{stream_name}/consumer/{consumer_name}`
- **Body:**
  - Consumer configuration (see NATS JetStream docs)

## Example
```typescript
consumer_config
```
[CONSUMER-CONFIG](./def/consumer-config.md)


## Response
- **200 OK**: Consumer updated successfully (returns consumer info)
- **422 Unprocessable Entity**: Validation error

