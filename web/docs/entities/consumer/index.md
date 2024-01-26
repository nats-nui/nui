
## INDEX
Get all consumers associated with a stream

### URL
```
GET /api/connection/:connection_id/stream/:stream_name/consumer
```
- `connection_id` uuid of saved connection
- `stream_name` name of the stream containig consumer

### BODY
`null`

### RESPONSE
```
consumer_info[]
```
[CONSUMER-INFO](./def/consumer-info.md)

