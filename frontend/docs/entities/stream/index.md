
## INDEX

Restituisce la COLLECTION di STREAMS presenti iin una specifica CONNECTION


### URL

```
GET /api/connection/:connection_id/stream
```

- `connection_id`  
identificativo CONNECTION che contiene gli STREAM restituiti


### BODY
`null`


### RESPONSE

```
stream_info[]
```

> from this INDEX API the `stream_info.state.subjects` field is always `null`


[STREAM-INFO](./def/stream-info.md)

