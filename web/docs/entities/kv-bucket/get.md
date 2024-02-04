
## GET
get the state of a specific bucket


### URL
```
GET /api/connection/:connection_id/kv/:bucket
```
- `connection_id`  
uuid of the connection to get the bucket from
- `bucket`
name of the bucket


### BODY
`null`


### RESPONSE
```
bucket_state
```
[BUCKET-STATE](./def/bucket-state.md)

