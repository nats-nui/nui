## DOWNLOAD
read the bytes of an object


### URL
```
GET /api/connection/:connection_id/obj/:bucket/object/:object/content
```
- `connection_id`  
uuid of the connection to get the object store from

- `bucket`
name of the object store

- `object`
name of the object. A single path segment

- `show_deleted`  
query parameter. `true` returns the bytes of an object that is marked as deleted


### BODY
`null`

### RESPONSE
The raw object bytes. The response is not JSON.

`Content-Length` is the object size in bytes.


### ERRORS
404 if the object store or the object does not exist.
A deleted object is 404 unless `show_deleted=true`.

[RESPONSE-ERROR](../errors/def/error.md)
