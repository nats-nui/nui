## TO SUBSCRIBE TO WEBSOCKET 

```
GET /ws/sub?id=<connection-id>
```


## WS MESSAGES

#### MESSAGE WRAPPER
wraps all the messages and events to and from the server.
```typescript
{
  "type": string,
  "payload": any // based on type
}
```


#### SUBSCRIPTIONS REQUEST
send an array of subject the client want to stream from  
client -> server
```typescript
{
	"type": "subscriptions_req",
    "subjects": string[],
}
```

#### NATS MESSAGE
message stream of subscribed subjects    
server -> client  
```typescript
{
	"type": "nats_msg"
	"subject": string,
	"payload": string // base64 encoded
}
```

#### CONNECTION STATUS
server -> client  
```typescript
{
	"type": "connection_status"
  	"status": "connected" |	"reconnecting" | "disconnected",
}
```


#### ERROR MESSAGE
client -> server  
server -> client  
```typescript
{
	"type": "error",
  	"error": string
}
```