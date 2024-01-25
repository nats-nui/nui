
## STREAM-STATE

```typescript
StreamState {
    messages: number;
    bytes: number;
    first_seq: number;
    // Go type: time
    first_ts: any;
    last_seq: number;
    // Go type: time
    last_ts: any;
    consumer_count: number;
    deleted: number[];
    num_deleted: number;
    num_subjects: number;
    subjects: {[key: string]: number};
}
```
