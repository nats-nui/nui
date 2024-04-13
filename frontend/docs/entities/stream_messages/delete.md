
## DELETE

Delete a message from a STREAM


### URL

```
DELETE /api/connection/:connection_id/stream/:stream_name/messages/:seq
```


### QUERY

- `connection_id`  
uuid of the CONNECTION that contains the STREAM messages
- `stream_name`  
name of the STREAM to retrieve messages from
- `seq`  
sequence number of the message to delete


### RESPONSE

200