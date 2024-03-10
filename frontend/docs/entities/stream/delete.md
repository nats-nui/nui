
## GET
Restituisce uno STREAM tramite il suo NAME e CONNECTION


### URL
```
DELETE /api/connection/:connection_id/stream/:stream_name
```
- `connection_id`  
  uuid of the CONNECTION that contains the STREAM messages
- `stream_name`
  name of the STREAM to retrieve messages from


### BODY
`null`


### RESPONSE
204

