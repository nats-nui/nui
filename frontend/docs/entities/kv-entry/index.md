
## INDEX
List of all the KV buckets for a connection


### URL
```
GET /api/connection/:connection_id/kv/:bucket/key
```
- `connection_id`  
uuid of the connection to get the KV buckets for

- `bucket`
name of the bucket to get the keys for


### BODY
`null`

### RESPONSE
```
kv-entry[] // value and history are null in index
```
[KV-ENTRY](./def/entry.md)


