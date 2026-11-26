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

- `interval` sets the number of matching messages to return. Without a start
  position, a negative count reads the latest matches. For example,
  `?subject=orders.created&interval=-1` returns the last stored message for
  `orders.created`. A positive count reads from the beginning of the stream.
- `seq_start` is an inclusive stream sequence. A positive count reads at or
  after that sequence. A negative count reads at or before it.
- `start_time` is an RFC 3339 timestamp. It takes precedence over `seq_start`
  and reads forward from the first match at or after that time.
- `subjects` accepts a comma-separated list of subjects.
- Repeat `subject` to pass names containing commas, for example
  `?seq_start=1&subject=orders.a%2Cb&subject=orders.c`.


### BODY

`null`


### RESPONSE

```typescript

stream_message[]

```

[STREAM-MESSAGE](./def/stream-message.md)
