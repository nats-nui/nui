## OBJECT-INFO

Metadata and instance data for one object in an object store.
`mtime` is an RFC 3339 timestamp.

```typescript
ObjectInfo {
    name: string
    description?: string
    headers?: {[key: string]: string[]}
    metadata?: {[key: string]: string}
    options?: ObjectMetaOptions
    bucket: string
    nuid: string // id assigned when the object was written
    size: number // size of the object bytes, not the metadata
    mtime: string
    chunks: number
    digest?: string // SHA-256 digest of the object bytes
    deleted?: boolean // present and true only when the object is marked as deleted
}
```

[OBJECT-META](./object-meta.md)

> `deleted` is omitted while the object is live
>
> a deleted object listed with `show_deleted=true` has `size` 0
