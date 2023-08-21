# nui


## Temp API doc


### Connection

```json
{
  "id" <uuid>,
  "name: <string>,
  "hosts": ["host1","host2"],
  "subscriptions": []<subscribtion>
}
```

### Subscription

```json
{
  "subject": <string>
}
```

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

### To subscribe to subjects via websdocket 

```
GET /ws/sub
```

#### Ws subscription request

```
{
    "connection_id": <uuid>,
    "subjects": []<string>
}
```


#### Ws messages from subscribed subjects

```
MESSAGE
{
  "subject": <string>,
  "payload": <string> // base64 encoded
}
```

```
ERROR MESSAGE
{
  "error": <string>
}
```
