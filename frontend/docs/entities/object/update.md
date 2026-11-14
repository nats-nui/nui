## UPDATE
update the metadata of an object. The bytes of the object are unchanged


### URL
```
POST /api/connection/:connection_id/obj/:bucket/object/:object
```
- `connection_id`  
uuid of the connection to get the object store from

- `bucket`
name of the object store

- `object`
current name of the object. A single path segment

- `show_deleted`  
query parameter. `true` allows the update to address an object that is marked as deleted


### BODY
```typescript
object_meta
```
[OBJECT-META](./def/object-meta.md)

`name` renames the object. An empty `name` keeps the name from the URL.
`digest`, `nuid`, `size`, and `chunks` stay the same.


### RESPONSE
```
object_info
```
The info of the object after the update. When `name` changes, the response uses the new name.

[OBJECT-INFO](./def/object-info.md)


### ERRORS
404 if the object store or the object does not exist

422 if the body is not valid JSON

[RESPONSE-ERROR](../errors/def/error.md)
