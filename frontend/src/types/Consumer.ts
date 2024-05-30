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

	////// BASIC INFO

	name?: string; // The name of the consumer - Not editable
	durableName?: string; // The name of the durable subscription - Not editable
	description?: string; // A description for the consumer - Editable
	// default Instant
	replayPolicy: ReplayPolicy; // The policy for message replay - Not editable


	////// DELIVERY POLICY

	// default: All
	deliverPolicy: DeliverPolicy; // The policy for message delivery - Not editable
	// only show in "DeliverByStartSequencePolicy", default 0
	optStartSeq?: number; // The sequence number to start delivering messages from - Not editable
	// only show in "DeliverByStartTimePolicy" - same format and behaviour as the stream time filter
	optStartTime?: any; // The time to start delivering messages from - Not editable
	filterSubjects?: string[]; // Array of subject to filter on for message delivery - Not editable
	filterSubject?: string; // The subject to filter on for message delivery - Not editable
	// default: checkbox - default 0  
	rateLimitBps?: number; // The rate limit in bytes per second for message delivery - Editable


	////// ACK POLICY

	ackPolicy: AckPolicy; // The policy for message acknowledgement - Not editable
	// checkbox with time interval (like streams time intervals) - default 0
	ackWait?: number; // The time to wait for message acknowledgement - Editable
	// what is the default value?
	maxDeliver?: number; // The maximum number of times a message will be delivered - Editable
	// default: checkbox - default 0 
	maxWaiting?: number; // The maximum number of waiting messages - Editable
	// default: checkbox - default 0 
	maxAckPending?: number; // The maximum number of unacknowledged messages - Editable
	// default checkbox - 0 (from 0 to 100)
	sampleFreq?: string; // The sampling frequency for metrics - Editable
	backoff?: number[]; // The backoff strategy for redelivery - Editable


	//// PULL OPTIONS

	// checkbox - default 0
	maxBatch?: number; // The maximum batch size for message delivery - Editable
	// checkbox - default 0
	maxExpires?: number; // The maximum time duration (nanoseconds) a message can exist - Editable
	// checkbox - default 0
	maxBytes?: number; // The maximum size of a message in bytes - Editable


	/// PUSH OPTIONS (legacy)

	//default ""
	deliverSubject?: string; // The subject to deliver the messages to - Not editable
	//default ""
	deliverGroup?: string; // The group to deliver the messages to - Not editable
	// what is the default value?
	flowControl?: boolean; // Whether flow control is enabled - Editable
	// default 0 - checkbox
	idleHeartbeat?: number; // The idle heartbeat interval - Editable
	// what is the default value?
	headersOnly?: boolean; // Whether to deliver only the headers of the message - Editable


	/// ADVANCED

	inactiveThreshold?: number; // The threshold for marking a consumer as inactive - Editable
	// checkbox - default 0
	numReplicas: number; // The number of replicas for the consumer - Not editable
	// checkbox - default off
	memStorage?: boolean; // Whether to use memory storage - Not editable
	metadata?: { [key: string]: string } // hash of string -> string to add custom metadata to consumer
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