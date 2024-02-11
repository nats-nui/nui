
## UPDATE
Modifico uno specifico STREAM dentro una CONNECTION


### URL
```
POST /api/connection/:connection_id/stream/:name
```
- `connection_id`  
identificativo CONNECTION che contiene lo STREAM
- `name`
nome dello STREAM da modificare


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

