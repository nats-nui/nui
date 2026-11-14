## INDEX
List the objects in an object store


### URL
```
GET /api/connection/:connection_id/obj/:bucket/object
```
- `connection_id`  
uuid of the connection to get the object store from

- `bucket`
name of the object store

- `show_deleted`  
query parameter. `true` includes objects marked as deleted. Any other value hides them


### BODY
`null`

### RESPONSE
```
object_info[]
```
Deleted objects are omitted unless `show_deleted=true`.
A deleted object has `deleted: true` and `size: 0`.
`deleted` is omitted when false.

[OBJECT-INFO](./def/object-info.md)


### ERRORS
404 if the object store does not exist

[RESPONSE-ERROR](../errors/def/error.md)
