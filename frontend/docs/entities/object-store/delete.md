## DELETE
delete an object store by name


### URL
```
DELETE /api/connection/:connection_id/obj/:bucket
```
- `connection_id`  
uuid of the connection to get the object store from
- `bucket`
name of the object store


### BODY
`null`


### RESPONSE
200


### ERRORS
404 if the object store does not exist

[RESPONSE-ERROR](../errors/def/error.md)
