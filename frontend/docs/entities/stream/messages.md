
## INDEX
Return a (filtered) COLLECTION of STREAMS-MESSAGES

### URL
```
GET /api/connection/:connection_id/stream/:stream_name/messages?seq_start=<>&interval=<>&subjects=<>
```
- `connection_id`  
uuid of the CONNECTION that contains the STREAM messages
- `stream_name`
name of the STREAM to retrieve messages from

### QUERY
- `seq_start`: message sequence number to start from
- `interval`: numebr of messages to retrieve (to allow pagination)
- `subjects`: filter messages by subject (only stream subject are allowed)

### BODY


### RESPONSE
```
stream_message[]
```
[STREAM-MESSAGE](./def/stream-message.md)

---

## DELETE
Delete a message from a STREAM

### URL
```
DELETE /api/connection/:connection_id/stream/:stream_name/messages/:seq
```

### QUERY
- `connection_id`: uuid of the CONNECTION that contains the STREAM messages
- `stream_name`: name of the STREAM to retrieve messages from
- `seq`: sequence number of the message to delete

### RESPONSE
200

