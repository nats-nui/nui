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

### Stream
```json

// stream info

{
    "config": <streamconfig>,
    "state": <stream-state>
}

// stream config
{
  "name": "myStream", // string, not editable
  "description": "", // string, omitted if empty
  "subjects": [], // array of strings, omitted if empty
  "retention": "limits", // string: "limits", "interest", or "workqueue", not editable
  "max_consumers": 0, // integer, omitted if zero, not editable
  "max_msgs": 0, // integer, omitted if zero
  "max_bytes": 0, // integer, omitted if zero
  "discard": "old", // string: "old" or "new"
  "max_age": 0, // integer, omitted if zero
  "max_msgs_per_subject": 0, // integer, omitted if zero
  "max_msg_size": 0, // integer, omitted if zero
  "storage": "file", // string: "file" or "memory", not editable
  "num_replicas": 0, // integer, omitted if zero
  "no_ack": false, // boolean, omitted if false
  "template_owner": "", // string, omitted if empty
  "duplicate_window": 0, // integer, omitted if zero
  "placement": { // object, omitted if null
    "cluster": "", // string, omitted if empty
    "tags": [] // array of strings, omitted if empty
  },
  "mirror": { // object, omitted if null, not editable, "name" is taken from stream names
    "name": "", // string, omitted if empty
    "opt_start_seq": 0, // integer, omitted if zero
    "filter_subject": "" // string, omitted if empty
  },
  "sources": [ // array of objects, omitted if empty, "name" is taken from stream names
    {
      "name": "", // string, omitted if empty
      "opt_start_seq": 0, // integer, omitted if zero
      "filter_subject": "", // string, omitted if empty
      "external": { // object, omitted if null
          "api": "" // string
          "deliver": "" // string
      }
      "domain": "" // string, omitted if empty
    }
  ],
  "sealed": false, // boolean, omitted if false
  "deny_delete": false, // boolean, omitted if false, not editable
  "deny_purge": false, // boolean, omitted if false, not editable
  "allow_rollup_hdrs": false, // boolean, omitted if false
  "republish": { // object, omitted if null
    "src": "", // string, omitted if empty
    "dest": "", // string, omitted if empty
    "headers_only": false // boolean, omitted if false
  },
  "allow_direct": false, // boolean, omitted if false
  "mirror_direct": false // boolean, omitted if false
}
```

### stream purge req
```
{
  "seq": 0, //integer, omit if not set!
  "filter": "foo.bar", // string (subject), omit if not set!
  "keep": 1 // integere, omit if not set!
}
```

#### CRUD on connection
```
GET /api/cconnection
POST /api/connection
POST /api/connection/:id
DELETE /api/connection/:id
```


#### REST on streams
```
GET /api/cconnection/:conn_id/stream -> stream info[]
GET /api/cconnection/:conn_id/stream/:name -> stream info
POST /api/connection/:conn_id/stream (stream config) -> stream info
POST /api/connection/:conn_id/stream/:name (stream config) -> stream info
DELETE /api/connection/:conn_id/stream/:name

POST /api/connection/:conn_id/stream/:name/purge


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
