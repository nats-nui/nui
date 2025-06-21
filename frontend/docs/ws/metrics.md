# Metrics WebSocket

See [WebSocket Protocol](./ws.md) for message wrapper and error format.

## TO SUBSCRIBE TO METRICS WEBSOCKET

```
GET /ws/metrics?id=<connection-id>
```

## WS MESSAGES

#### METRICS REQUEST
Client requests metrics stream for a connection.  
client -> server
```typescript
{
  "type": "metrics_req",
  "payload": {
    "enabled": boolean
  }
}
```

#### METRICS RESPONSE
Server sends metrics updates to the client.  
server -> client
```typescript
{
  "type": "metrics_resp",
  "payload": {
    "nats": { [key: string]: any },
    "error": string
  }
}
```

## NATS METRICS STRUCTURE

The `nats` object contains nats server metrics directly from the NATS monitoring endpoints. 
The keys names match the ones used in the NATS server monitoring API, and the values are the corresponding data structures.

* `varz` - Server statistics including configuration, uptime, memory usage, etc.
* `connz` - Connection statistics including client connections and their activity.
