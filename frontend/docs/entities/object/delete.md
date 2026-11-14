## DELETE
mark an object as deleted and purge its chunks


### URL
```
DELETE /api/connection/:connection_id/obj/:bucket/object/:object
```
- `connection_id`  
uuid of the connection to get the object store from

- `bucket`
name of the object store

- `object`
name of the object. A single path segment

- `show_deleted`  
query parameter. `true` looks up an object that is already marked as deleted


### BODY
`null`

### RESPONSE
200

The object no longer appears in INDEX or GET unless `show_deleted=true`.


### ERRORS
404 if the object store or the object does not exist.
A deleted object is 404 unless `show_deleted=true`.

[RESPONSE-ERROR](../errors/def/error.md)
