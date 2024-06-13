## STREAM-MESSAGE

Messaggio contenuto nello STREAM

```typescript

interface StreamMessage {

    seq_num:  number

    subject: string,
    payload: string,        // base64 encoded
    headers: { [key: string]: string[] },
    
    size?: number           // NON USATO
    received_at?: number 
}

```
