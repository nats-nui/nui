## OBJECT-STORE-STATE

Runtime status of an object store. Durations are nanoseconds.

```typescript
ObjectStoreState {
    bucket: string // name of the object store
    description: string
    ttl: number // max age of objects, in nanoseconds
    storage_type: STORAGE // "file" or "memory"
    replicas: number
    sealed: boolean
    size: number // combined size of data and metadata, in bytes
    backing_store: string // "JetStream"
    metadata: {[key: string]: string} | null
    compressed: boolean
    config: ObjectStoreConfig | null
}
```

[OBJECT-STORE-CONFIG](./store-config.md)

> `config` is `null` from INDEX, CREATE, and UPDATE
>
> `config` is set only by GET
