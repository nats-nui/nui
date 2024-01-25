
## STREAM-CONSUMER

```typescript
StreamConsumer {
    stream_name: string;
    name: string;
    // Go type: time
    created: any;
    config: ConsumerConfig;
    delivered: SequenceInfo;
    ack_floor: SequenceInfo;
    num_ack_pending: number;
    num_redelivered: number;
    num_waiting: number;
    num_pending: number;
    cluster?: ClusterInfo;
    push_bound?: boolean;
}
```


