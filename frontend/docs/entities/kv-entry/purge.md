
## DELETE
purge history keeping only the last value and operation


### URL
```
POST /api/connection/:connection_id/kv/:bucket/key/:key/purge
```
- `connection_id`  
uuid of the connection to get the KV buckets for

- `bucket`
name of the bucket to get the keys for

- `key`
key to get the value for


### BODY
`null`

### RESPONSE
204

