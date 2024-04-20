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
message sequence number to fetch from
- `start_time`
datetime (in RCF3339) to fetch from. it takes precendence over the `seq_start` parameter 
- `interval`  
number of messages to retrieve (to allow pagination). if the fetch is by seq_number, 
also negative interval are permitted
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
