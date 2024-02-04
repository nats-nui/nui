
## GET
get a key value pair from a bucket by name


### URL
```
GET /api/connection/:connection_id/kv/:bucket/key/:key
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
```
kv-entry
```
[KV-ENTRY](./def/entry.md)


