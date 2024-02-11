
## STREAM-STATE

Questo oggetto non è editabile

```typescript
StreamState {
    messages: number; // The number of messages
    bytes: number; // The size of the messages in bytes
    first_seq: number; // The sequence number of the first message
    first_ts: any; // The timestamp of the first message (Go type: time)
    last_seq: number; // The sequence number of the last message
    last_ts: any; // The timestamp of the last message (Go type: time)
    consumer_count: number; // The number of consumers
    deleted: number[]; // The sequence numbers of the deleted messages
    num_deleted: number; // The number of deleted messages
    num_subjects: number; // The number of subjects
    subjects: {[key: string]: number}; // The number of messages for each subject
}
```
