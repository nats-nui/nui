
## STREAM-CONSUMER

```typescript
StreamConsumer {
    stream_name: string; // The name of the stream the consumer is attached to
    name: string; // The name of the consumer
    created: any; // The time the consumer was created
    config: ConsumerConfig; // The configuration of the consumer
    delivered: SequenceInfo; // Information about the sequence of the last delivered message
    ack_floor: SequenceInfo; // Information about the sequence of the last acknowledged message
    num_ack_pending: number; // The number of messages that have been delivered but not yet acknowledged
    num_redelivered: number; // The number of messages that have been redelivered
    num_waiting: number; // The number of messages that are waiting to be delivered
    num_pending: number; // The number of messages that are pending delivery
    cluster?: ClusterInfo; // Information about the cluster the consumer is part of
    push_bound?: boolean; // Whether the consumer is bound to a push subscription
    paused?: boolean; // Whether the consumer is currently paused - Read only
}
```

## SEQUENCE-INFO

```typescript
SequenceInfo
{
    consumer_seq: number
    stream_seq: number
    // Go type: time
    last_active ? : any
}
```
## CLUSTER-INFO

```typescript
ClusterInfo
{
    name ? : string
    leader ? : string
}
```

