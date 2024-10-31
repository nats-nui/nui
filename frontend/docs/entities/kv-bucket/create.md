
## CREATE
create a new KV Bucket


### URL
```
POST /api/connection/:connection_id/kv
```
- `connection_id`  
uuid of connection to create the bucket on


### BODY
```typescript
bucket_config
```
[BUCKET-CONFIG](./def/bucket-config.md)


### RESPONSE
```
stream_state
```
[BUCKET-STATE](./def/bucket-state.md)

