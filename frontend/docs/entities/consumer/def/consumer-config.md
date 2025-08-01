## CONSUMER-CONFIG

```typescript
ConsumerConfig {
    ////// BASIC INFO
    name?: string; // The name of the consumer - Not editable
    durableName?: string; // The name of the durable subscription - Not editable
    description?: string; // A description for the consumer - Editable

    // default Instant
    replayPolicy: ReplayPolicy; // The policy for message replay - Not editable


    ////// DELIVERY POLICY

    // default: All
    deliverPolicy: DeliverPolicy; // The policy for message delivery - Not editable


    // only show in "by sequence policy", default 0
    optStartSeq?: number; // The sequence number to start delivering messages from - Not editable

    // only show in "by time policy" - same format and behaviour as the stream time filter
    optStartTime?: any; // The time to start delivering messages from - Not editable
    // what is the default value?

    filterSubjects?: string[]; // Array of subject to filter on for message delivery - Not editable
    filterSubject?: string; // The subject to filter on for message delivery - Not editable

    // default: checkbox - default 0  
    rateLimitBps?: number; // The rate limit in bytes per second for message delivery - Editable




    ////// ACK POLICY

    ackPolicy: AckPolicy; // The policy for message acknowledgement - Not editable
    // checkbox with time interval (like streams time intervals) - default 0
    ackWait?: number; // The time to wait for message acknowledgement - Editable
    maxDeliver?: number; // The maximum number of times a message will be delivered - Editable
    maxWaiting?: number; // The maximum number of waiting messages - Editable
    maxAckPending?: number; // The maximum number of unacknowledged messages - Editable
    // default checkbox - 0 (from 0 to 100)
    sampleFreq?: string; // The sampling frequency for metrics - Editable
    // ok nanoseconds
    backoff?: number[]; // The backoff strategy for redelivery - Editable


    //// PULL OPTIONS
    // checkbox - default 1
    maxBatch?: number; // The maximum batch size for message delivery - Editable
    // checkbox - default 1
    maxExpires?: number; // The maximum time duration (nanoseconds) a message can exist - Editable
    // checkbox - default 1
    maxBytes?: number; // The maximum size of a message in bytes - Editable
    
    /// ADVANCED

    // checkbox - default 1
    inactiveThreshold?: number; // The threshold for marking a consumer as inactive - Editable
    // checkbox - default 1
    numReplicas: number; // The number of replicas for the consumer - Not editable
    // checkbox - default off
    memStorage?: boolean; // Whether to use memory storage - Not editable
    metadata? {[key: string] : string} // hash of string -> string to add custom metadata to consumer

    // NATS 2.11+: Pause delivery of messages until the given time (ISO string)
    pauseUntil?: string; // The time until which the consumer is paused - Editable
}
```
