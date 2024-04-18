## STREAM-MESSAGE

Messaggio contenuto nello STREAM

```typescript

interface StreamMessage {

    seq_num:  number

    headers: string[],
    subject: string,
    payload: string,        // base64 encoded

    size?: number           // NON USATO
    received_at?: number    // NON USATO
}

```
