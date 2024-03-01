# INTERFACES

## STREAM-INFO

Wrap per INFO E STATE

```typescript
StreamInfo {
	config: StreamConfig
	state?: StreamState
}
```

- If `state` is `null` then it means that the STREAM-INFO is new