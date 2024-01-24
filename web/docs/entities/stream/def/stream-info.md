# INTERFACES

## STREAM-INFO

Wrap per INFO E STATE

```typescript
StreamInfo {
	config: StreamConfig
	state?: StreamState
}
```

- Se `state` è `null` allora vul dire che lo STREAM-INFO è nuovo
