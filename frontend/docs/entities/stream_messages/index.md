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

- `seq_start`  
message sequence number to start from
 
- `interval`  
numebr of messages to retrieve (to allow pagination)
 
- `subjects`  
filter messages by subject.  
concatenated into a single string divided with ","


### BODY

`null`


### RESPONSE

```typescript

stream_message[]

```

[STREAM-MESSAGE](./def/stream-message.md)
