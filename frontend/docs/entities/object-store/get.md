## GET
get the state of a specific object store


### URL
```
GET /api/connection/:connection_id/obj/:bucket
```
- `connection_id`  
uuid of the connection to get the object store from
- `bucket`
name of the object store


### BODY
`null`


### RESPONSE
```
object_store_state
```
`config` is filled from the backing `OBJ_<bucket>` stream

[OBJECT-STORE-STATE](./def/store-state.md)


### ERRORS
404 if the object store does not exist

[RESPONSE-ERROR](../errors/def/error.md)
