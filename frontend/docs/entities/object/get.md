## GET
get the metadata of one object


### URL
```
GET /api/connection/:connection_id/obj/:bucket/object/:object
```
- `connection_id`  
uuid of the connection to get the object store from

- `bucket`
name of the object store

- `object`
name of the object. A single path segment

- `show_deleted`  
query parameter. `true` returns an object that is marked as deleted


### BODY
`null`

### RESPONSE
```
object_info
```
[OBJECT-INFO](./def/object-info.md)


### ERRORS
404 if the object store or the object does not exist.
A deleted object is 404 unless `show_deleted=true`.

[RESPONSE-ERROR](../errors/def/error.md)
