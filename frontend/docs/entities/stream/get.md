
## GET
Restituisce uno STREAM tramite il suo NAME e CONNECTION


### URL
```
GET /api/connection/:connection_id/stream/:stream_name
```

- `connection_id`  
  uuid of the CONNECTION that contains the STREAM messages
- `stream_name`
  name of the STREAM to retrieve messages from
- `subject` (optional query parameter)
  limit subject counts to one exact subject


### BODY
`null`


### RESPONSE
```
stream_info
```
[STREAM-INFO](./def/stream-info.md)

