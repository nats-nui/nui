
## PURGE DELETED KEYS
purge all the bucket keys already marked as deleted


### URL
```
DELETE /api/connection/:connection_id/kv/:bucket/purge_deleted
```
- `connection_id`  
uuid of the connection to get the bucket from
- `bucket`
name of the bucket


### BODY
`null`


### RESPONSE
204
