## OBJECT-META

Metadata written by [UPDATE](../update.md).
It does not change the object bytes. `digest` and `nuid` stay the same.

```typescript
ObjectMeta {
    name: string // empty keeps the current name. A different name renames the object
    description?: string
    headers?: {[key: string]: string[]}
    metadata?: {[key: string]: string}
    options?: ObjectMetaOptions
}
```

## OBJECT-META-OPTIONS

```typescript
ObjectMetaOptions {
    link?: ObjectLink // set by a link, not by hand
    max_chunk_size?: number // max size of each chunk in bytes. Default is 128k
}
```

## OBJECT-LINK

```typescript
ObjectLink {
    bucket: string
    name?: string // empty means a link to the whole store
}
```
