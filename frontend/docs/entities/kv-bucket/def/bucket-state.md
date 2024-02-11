
## STREAM-CONSUMER

```typescript
BucketState {
    bucket: string // The name of the bucket
    values: number // The number of key-values in the bucket
    history: number // The max entries history of the bucket
    ttl: number // ttl in nanoseconds
    backing_store: STORAGE // The backing store of the bucket, same as stream storage
    bytes: number // The size of the bucket in bytes
    compressed: boolean // Whether the bucket is compressed or not
}
```