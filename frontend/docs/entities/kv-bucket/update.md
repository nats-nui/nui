## UPDATE

Modifico uno specifico BUCKET dentro una CONNECTION


### URL

```
POST /api/connection/:connection_id/kv/:bucket
```

- `connection_id`  
identificativo CONNECTION che contiene lo STREAM
- `bucket`  
nome del BUCKET da modificare


### BODY

```typescript
bucket_config
```

[BUCKET-CONFIG](./def/bucket-config.md)


### RESPONSE

```
bucket_state
```

[BUCKET-STATE](./def/bucket-state.md)

