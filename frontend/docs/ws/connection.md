# Connection WebSocket

See [WebSocket Protocol](./ws.md) for message wrapper and error format.

## TO SUBSCRIBE TO WEBSOCKET 

```
GET /ws/sub?id=<connection-id>
```

## WS MESSAGES

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
    "headers": {[key: string] : string[]}
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
