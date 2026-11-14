## UPDATE
update an existing object store


### URL
```
POST /api/connection/:connection_id/obj/:bucket
```
- `connection_id`  
uuid of the connection that contains the object store
- `bucket`  
path segment of the route. The store that is updated is the one named by `bucket` in the body


### BODY
```typescript
object_store_config
```
[OBJECT-STORE-CONFIG](./def/store-config.md)


### RESPONSE
```
object_store_state
```
`config` is null. `ttl` reflects the `max_age` sent in the body

[OBJECT-STORE-STATE](./def/store-state.md)


### ERRORS
422 if the body is not a valid object store config

[RESPONSE-ERROR](../errors/def/error.md)
