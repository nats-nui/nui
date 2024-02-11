
## CONSUMER-CONFIG

```typescript
ConsumerConfig {
    durable_name?: string; // The name of the durable subscription
    name?: string; // The name of the consumer
    description?: string; // A description for the consumer
    deliver_policy: number; // The policy for message delivery
    opt_start_seq?: number; // The sequence number to start delivering messages from
    opt_start_time?: any; // The time to start delivering messages from
    ack_policy: number; // The policy for message acknowledgement
    ack_wait?: number; // The time to wait for message acknowledgement
    max_deliver?: number; // The maximum number of times a message will be delivered
    backoff?: number[]; // The backoff strategy for redelivery
    filter_subject?: string; // The subject to filter on for message delivery
    replay_policy: number; // The policy for message replay
    rate_limit_bps?: number; // The rate limit in bytes per second for message delivery
    sample_freq?: string; // The sampling frequency for metrics
    max_waiting?: number; // The maximum number of waiting messages
    max_ack_pending?: number; // The maximum number of unacknowledged messages
    flow_control?: boolean; // Whether flow control is enabled
    idle_heartbeat?: number; // The idle heartbeat interval
    headers_only?: boolean; // Whether to deliver only the headers of the message
    max_batch?: number; // The maximum batch size for message delivery
    max_expires?: number; // The maximum time a message can exist
    max_bytes?: number; // The maximum size of a message in bytes
    deliver_subject?: string; // The subject to deliver the messages to
    deliver_group?: string; // The group to deliver the messages to
    inactive_threshold?: number; // The threshold for marking a consumer as inactive
    num_replicas: number; // The number of replicas for the consumer
    mem_storage?: boolean; // Whether to use memory storage
}
```

