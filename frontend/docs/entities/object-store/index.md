## INDEX
List of all the object stores for a connection


### URL
```
GET /api/connection/:connection_id/obj
```

- `connection_id`  
uuid of the connection to get the object stores for

### BODY
`null`


### RESPONSE
```
object_store_state[]
```
stores come with config = null

[OBJECT-STORE-STATE](./def/store-state.md)
