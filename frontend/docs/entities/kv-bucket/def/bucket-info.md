# INTERFACES

## BUCKET-INFO

Wrap per STATE E CONFIG

```typescript

BucketInfo {
	config: BucketConfig
	state?: BucketState
}

```

> If `state` is `null` then it means that the BUCKET-INFO is new