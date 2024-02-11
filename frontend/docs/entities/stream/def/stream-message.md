## STREAM-MESSAGE

Messaggio contenuto nello STREAM

```typescript
StreamMessage {
    seq_num:  number

    headers: string[],
    subject: string,
    payload: string, // base64 encoded

    size?: number
	received_at?: number
}
```
