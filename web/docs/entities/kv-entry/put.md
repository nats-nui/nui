
## PUT
add or update a key value pair in a bucket by name


### URL
```
POST /api/connection/:connection_id/kv/:bucket/key/:key
```
- `connection_id`  
uuid of the connection to get the KV buckets for

- `bucket`
name of the bucket to get the keys for

- `key`
key to get the value for


### BODY
```typescript
{
  "payload": string // value to set encoded in base64
}
```

### RESPONSE
```
kv-entry
```
[KV-ENTRY](./def/entry.md)


