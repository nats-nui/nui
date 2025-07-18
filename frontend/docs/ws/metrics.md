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
type metric = {
  type: "metrics_resp",
  payload: {
    nats: { 
      connz: {[key: string]: any },
      varz: {
        cpu: number,
        mem: number,
        out_msgs: number,
        out_bytes: number,
        in_msgs: number,
        in_bytes: number,
        total_connections: number,
        subscriptions: number,
        slow_consumers: number,
        max_connections: number,
        max_payload: number,
        max_pending: number,
        write_deadline: number,
        auth_timeout: number,
        tls_timeout: number,

        nui_in_bytes_sec: number,
        nui_in_msgs_sec: number,
        nui_out_bytes_sec: number,
        nui_out_msgs_sec: number,
      },
    },
    error: string,
  }
}
```



## NATS METRICS STRUCTURE

The `nats` object contains nats server metrics directly from the NATS monitoring endpoints. 
The keys names match the ones used in the NATS server monitoring API, and the values are the corresponding data structures.

* `varz` - Server statistics including configuration, uptime, memory usage, etc.
* `connz` - Connection statistics including client connections and their activity.
