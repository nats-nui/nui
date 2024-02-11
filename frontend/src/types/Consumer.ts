import { TimestampString } from "./global"

export interface StreamConsumer {
	/** The name of the stream the consumer is attached to  */
	streamName: string
	/** The name of the consumer */
	name: string
	/** The time the consumer was created */
	created: TimestampString
	/** The configuration of the consumer */
	config: ConsumerConfig
	/** Information about the sequence of the last delivered message */
	delivered: SequenceInfo
	/** Information about the sequence of the last acknowledged message */
	ackFloor: SequenceInfo
	/** The number of messages that have been delivered but not yet acknowledged */
	numAckPending: number
	/** The number of messages that have been redelivered */
	numRedelivered: number
	/** The number of messages that are waiting to be delivered */
	numWaiting: number
	/** The number of messages that are pending delivery */
	numPending: number
	/** Information about the cluster the consumer is part of */
	cluster?: ClusterInfo
	/** Whether the consumer is bound to a push subscription */
	pushBound?: boolean
}

export interface ConsumerConfig {
	durableName?: string; // The name of the durable subscription
    name?: string; // The name of the consumer
    description?: string; // A description for the consumer
    deliverPolicy: number; // The policy for message delivery
    optStartSeq?: number; // The sequence number to start delivering messages from
    optStartTime?: any; // The time to start delivering messages from
    ackPolicy: number; // The policy for message acknowledgement
    ackWait?: number; // The time to wait for message acknowledgement
    maxDeliver?: number; // The maximum number of times a message will be delivered
    backoff?: number[]; // The backoff strategy for redelivery
    filterSubject?: string; // The subject to filter on for message delivery
    replayPolicy: number; // The policy for message replay
    rateLimitBps?: number; // The rate limit in bytes per second for message delivery
    sampleFreq?: string; // The sampling frequency for metrics
    maxWaiting?: number; // The maximum number of waiting messages
    maxAckPending?: number; // The maximum number of unacknowledged messages
    flowControl?: boolean; // Whether flow control is enabled
    idleHeartbeat?: number; // The idle heartbeat interval
    headersOnly?: boolean; // Whether to deliver only the headers of the message
    maxBatch?: number; // The maximum batch size for message delivery
    maxExpires?: number; // The maximum time a message can exist
    maxBytes?: number; // The maximum size of a message in bytes
    deliverSubject?: string; // The subject to deliver the messages to
    deliverGroup?: string; // The group to deliver the messages to
    inactiveThreshold?: number; // The threshold for marking a consumer as inactive
    numReplicas: number; // The number of replicas for the consumer
    memStorage?: boolean; // Whether to use memory storage
}

export interface SequenceInfo {
	consumerSeq: number
	streamSeq: number
	// Go type: time
	lastActive?: any
}
export interface ClusterInfo {
	name?: string
	leader?: string
}