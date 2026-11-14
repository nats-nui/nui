## CREATE
create a new object store


### URL
```
POST /api/connection/:connection_id/obj
```
- `connection_id`  
uuid of the connection to create the object store on


### BODY
```typescript
object_store_config
```
[OBJECT-STORE-CONFIG](./def/store-config.md)


### RESPONSE
```
object_store_state
```
`config` is null

[OBJECT-STORE-STATE](./def/store-state.md)


### ERRORS
422 if the body is not a valid object store config

[RESPONSE-ERROR](../errors/def/error.md)
