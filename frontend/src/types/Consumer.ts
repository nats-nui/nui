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
	durableName?: string; // The name of the durable subscription - Not editable
	name?: string; // The name of the consumer - Not editable
	description?: string; // A description for the consumer - Editable
	deliverPolicy: DeliverPolicy; // The policy for message delivery - Not editable
	optStartSeq?: number; // The sequence number to start delivering messages from - Not editable
	optStartTime?: any; // The time to start delivering messages from - Not editable
	ackPolicy: AckPolicy; // The policy for message acknowledgement - Not editable
	ackWait?: number; // The time to wait for message acknowledgement - Editable
	maxDeliver?: number; // The maximum number of times a message will be delivered - Editable
	backoff?: number[]; // The backoff strategy for redelivery - Editable
	filterSubject?: string; // The subject to filter on for message delivery - Not editable
	replayPolicy: ReplayPolicy; // The policy for message replay - Not editable
	rateLimitBps?: number; // The rate limit in bytes per second for message delivery - Editable
	sampleFreq?: string; // The sampling frequency for metrics - Editable
	maxWaiting?: number; // The maximum number of waiting messages - Editable
	maxAckPending?: number; // The maximum number of unacknowledged messages - Editable
	flowControl?: boolean; // Whether flow control is enabled - Editable
	idleHeartbeat?: number; // The idle heartbeat interval - Editable
	headersOnly?: boolean; // Whether to deliver only the headers of the message - Editable
	maxBatch?: number; // The maximum batch size for message delivery - Editable
	maxExpires?: number; // The maximum time duration (nanoseconds) a message can exist - Editable
	maxBytes?: number; // The maximum size of a message in bytes - Editable
	deliverSubject?: string; // The subject to deliver the messages to - Not editable
	deliverGroup?: string; // The group to deliver the messages to - Not editable
	inactiveThreshold?: number; // The threshold for marking a consumer as inactive - Editable
	numReplicas: number; // The number of replicas for the consumer - Not editable
	memStorage?: boolean; // Whether to use memory storage - Not editable
}

export enum DeliverPolicy {
	DeliverAllPolicy = "all",
	DeliverLastPolicy = "last",
	DeliverNewPolicy = "new",
	DeliverByStartSequencePolicy = "by_start_sequence",
	DeliverByStartTimePolicy = "by_start_time",
	DeliverLastPerSubjectPolicy = "last_per_subject"
}

export enum AckPolicy {
	AckExplicitPolicy = "explicit",
	AckAllPolicy = "all",
	AckNonePolicy = "none"
}

export enum ReplayPolicy {
	ReplayInstantPolicy = "instant",
	ReplayOriginalPolicy = "original"
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