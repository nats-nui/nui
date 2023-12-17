# nui


## Temp API doc


### Connection

```json
{
  "id" <uuid>,
  "name: <string>,
  "hosts": ["host1","host2"],
  "subscriptions": []<subscribtion>,
  "auth": []<auth>
}
```

#### Subscription

```json
{
  "subject": <string>
}
```

#### Auth

```json
{
  "mode" : <mode>
  "username" : <string>
  "password" :  <string>
  "token" : <string>
  "jwt" :  <string>
  "nkey" : <string>
  "creds" :  <string>
}

```
modes:
- "auth_none" -> no other info to set
- "auth_token" -> use token field
- "auth_user_password" -> use username and password fields
- "auth_jwt" -> use jwt and nkey fields
- "auth_creds_file" -> use creds field (local path to a file)

#### CRUD on connection
```
GET /api/cconnection
POST /api/connection
POST /api/connection/:id
DELETE /api/connection/:id
```

### TO publish a message

#### Request

```
POST /api/connection/:id/publish

{
    "subject": <string>,
    "payload": <string>  // base64 encoded
}
```

#### Response

200 OK - no body


### To send a Request / Response

#### Request

```
POST /api/connection/:id/request

{
    "subject": <string>,
    "payload": <string>
}
```


#### Response

```
200 OK

{
  "payload" <string> // base64 encoded
}
```

### To subscribe to websocket 

```
GET /ws/sub?id=<connection-id>
```


#### Ws messages

```
MESSAGE WRAPPER
wraps all the messages and events to and from the server.
{
  "type": <string>,
  "payload": <object> // based on type
}
```

```
SUBSCRIPTIONS REQUEST
send an array of subject the client want to stream from
sender: client
type: subscriptions_req
{
    "subjects": []<string>
}
```


```
NATS MESSAGE
message stream of subscribed subjects
sender: server
type: nats_msg
{
  "subject": <string>,
  "payload": <string> // base64 encoded
}
```

```
CONNECTION STATUS
sender: server
type: connection_status
{
  "status": <string> // connected - reconnecting - disconnected
}
```
    
```
ERROR MESSAGE
sender: client, server
type: error
{
  "error": <string>
}
```
