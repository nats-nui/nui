
## STREAM-STATE

Questo oggetto non è editabile

```typescript
StreamState {
    // numero messaggi arrivati
    messages: number;
    // quantità in byte occupata ai messaggi
    bytes: number;
    // ???
    first_seq: number;
    // Go type: time
    first_ts: any;
    // ???
    last_seq: number;
    // Go type: time
    last_ts: any;
    // numro di CONSUMER
    consumer_count: number;
    // ???
    deleted: number[];
    // ???
    num_deleted: number;
    // ???
    num_subjects: number;
    // numero di messaggi per ogni SUBJECT
    subjects: {[key: string]: number};
}
```
