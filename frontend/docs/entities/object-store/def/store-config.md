## OBJECT-STORE-CONFIG

Configuration accepted when creating or updating an object store.
Omitted fields take the server default.

The JSON names differ from [OBJECT-STORE-STATE](./store-state.md): age is `max_age` here and `ttl` on the state, storage is `storage` here and `storage_type` on the state, replica count is `num_replicas` here and `replicas` on the state.

```typescript
ObjectStoreConfig {
    bucket: string // name of the object store. Unique. Alphanumeric, dashes, and underscores
    description?: string
    max_age?: number // max age of objects, in nanoseconds. 0 means objects do not expire
    max_bytes?: number // max size of the store in bytes. Default is unlimited
    storage?: STORAGE // "file" (default) or "memory"
    num_replicas?: number // 1 to 5, default 1
    placement?: Placement
    compression?: boolean // compress the backing stream. Requires nats-server 2.10.0+
    metadata?: {[key: string]: string} // requires nats-server 2.10.0+
}
```

## PLACEMENT

```typescript
Placement {
    cluster: string
    tags?: string[]
}
```

## STORAGE

```typescript
STORAGE {
    FILE = "file",
    MEMORY = "memory",
}
```
