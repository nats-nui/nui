
## CREATE
Crea uno STREAM dentro una CONNECTION


### URL
```
POST /api/connection/:connection_id/stream/:stream_name/purge
```
- `connection_id`  
  uuid of the CONNECTION that contains the STREAM messages
- `stream_name`
  name of the STREAM to retrieve messages from

### BODY

```typescript
PurgeParams
{
    seq: number // purge up to this sequence number - 1
    keep: number // keep the last n messages (alternative to seq)
    subject: string // purge messages with this subject
}
```


### RESPONSE
204


