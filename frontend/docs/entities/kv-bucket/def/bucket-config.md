
## BUCKET-CONFIG

```typescript
BucketConfig {
    bucket: string // The name of the bucket
    description: string // The description of the bucket
    maxValueSize: number // The maximum size of a value in the bucket
    history: number  // The max entries history of the bucket
    ttl: number // ttl in nanoseconds
    maxBytes: number // The maximum size of the bucket in bytes
    storage: STORAGE // The storage type of the bucket (Go type: StorageType)
    replicas: number // The number of replicas for the bucket
    placement: Placement // The placement strategy for the bucket (same as stream )
    rePublish: Republish // The republish strategy for the bucket  (same as stream)
    mirror: Mirror // The mirror source for the bucket (same as stream)
    sources: Source[] // The sources for the bucket (same as stream)
    compression: boolean // Whether the bucket is compressed or not
    metadata? {[key: string] : string} // hash of string -> string to add custom metadata to consumer
}
```