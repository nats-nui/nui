
## GET
Restituisce un CONSUMER tramite il suo NAME e CONNECTION e STREAM-NAME


### URL
```
GET /api/connection/:connection_id/stream/:stream_name/consumer/:consumer_name
```
- `connection_id`  
identificativo CONNECTION che contiene lo STREAM
- `stream_name`
nome dello STREAM che contiene il CONSUMER
- `consumer_name`
nome del CONSUMER da restituire


### BODY
`null`


### RESPONSE
```
consumer_info
```
[CONSUMER-INFO](./def/stream-consumer.md)