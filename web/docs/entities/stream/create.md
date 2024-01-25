
## CREATE
Crea uno STREAM dentro una CONNECTION


### URL
```
POST /api/connection/:connection_id/stream
```
- `connection_id`  
identificativo CONNECTION dentro la quale creare lo STREAM


### BODY
```typescript
stream_config
```
[STREAM-CONFIG](./def/stream-config.md)


### RESPONSE
```
stream_info
```
[STREAM-INFO](./def/stream-info.md)

