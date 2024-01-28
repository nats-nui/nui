

Restituisce una COLLECTION di STREAMS-MESSAGES


### URL
```
GET /api/connection/:connection_id/stream/:stream_name/messages?seq_start=<>&interval=<>&subjects=<>
```
- `connection_id`  
identificativo CONNECTION che contiene lo STREAM
- `stream_name`  
nome dello STREAM che contiene gli STREAM-MESSAGEs

### QUERY
- `seq_start`: message sequence number to start from
- `interval`: numebr of messages to retrieve (to allow pagination)
- `subjects`: filter messages by subject (only stream subject are allowed)

### BODY


### RESPONSE
```
stream_message[]
```
[STREAM-INFO](./def/stream-message.md)