
## GET
Restituisce uno STREAM tramite il suo NAME e CONNECTION


### URL
```
GET /api/connection/:connection_id/stream/:name
```
- `connection_id`  
identificativo CONNECTION che contiene lo STREAM
- `name`
nome dello STREAM da restituire


### BODY
`null`


### RESPONSE
```
stream_info
```
[STREAM-INFO](./def/stream-info.md)

