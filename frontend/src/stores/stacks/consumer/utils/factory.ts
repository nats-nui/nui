import { buildStore } from "@/stores/docs/utils/factory";
import { DOC_TYPE, EDIT_STATE } from "@/types";
import { AckPolicy, ConsumerConfig, DeliverPolicy, ReplayPolicy, StreamConsumer } from "@/types/Consumer";
import { StreamInfo } from "@/types/Stream";
import { ConsumersState, ConsumersStore } from "..";
import { VIEW_SIZE } from "../../utils";
import { ConsumerState, ConsumerStore } from "../detail";



export function buildConsumer(connectionId: string, streamName: string, consumer: StreamConsumer) {
	if (!connectionId || !streamName || !consumer) { console.error("no param"); return null; }
	const consumerStore = buildStore({
		type: DOC_TYPE.CONSUMER,
		connectionId: connectionId,
		streamName: streamName,
		consumer,
	} as ConsumerState) as ConsumerStore;
	return consumerStore;
}

export function buildConsumers(connectionId: string, stream: Partial<StreamInfo>) {
	if (!stream?.config?.name || !connectionId) { console.error("no param"); return null; }
	const consumerStore = buildStore({
		type: DOC_TYPE.CONSUMERS,
		connectionId: connectionId,
		streamName: stream.config.name,
	} as ConsumersState) as ConsumersStore;
	return consumerStore;
}

export function buildConsumerNew(connectionId: string, streamName: string) {
	if (!connectionId) { console.error("no param"); return null; }
	const store = buildStore({
		type: DOC_TYPE.CONSUMER,
		editState: EDIT_STATE.NEW,
		size: VIEW_SIZE.NORMAL,
		sizeForce: true,
		connectionId: connectionId,
		streamName: streamName,
		consumer: newConsumer(),
	} as ConsumerState) as ConsumerStore;
	return store;
}

export function newConsumer(): StreamConsumer {
	return {
		name: "",
		streamName: "",
		created: null,
		config: newConsumerConfig(),
		delivered: null,
		ackFloor: null,
		numAckPending: 0,
		numRedelivered: 0,
		numWaiting: 0,
		numPending: 0,
		cluster: null,
		pushBound: null,
	}
}

export function newConsumerConfig(): ConsumerConfig {
	return {

		////// BASIC INFO
		name: "",
		durableName: "",
		description: "",
		replayPolicy: ReplayPolicy.ReplayInstantPolicy,

		////// DELIVERY POLICY
		deliverPolicy: DeliverPolicy.DeliverAllPolicy,
		optStartSeq: 0,
		optStartTime: null,
		filterSubject: "",
		filterSubjects: [],
		rateLimitBps: 0,

		////// ACK POLICY
		ackPolicy: AckPolicy.AckAllPolicy,
		ackWait: 0,
		maxDeliver: 0,
		maxWaiting: 0,
		maxAckPending: 0,
		sampleFreq: "",
		backoff: [],

		//// PULL OPTIONS
		maxBatch: 0,
		maxExpires: 0,
		maxBytes: 0,

		/// PUSH OPTIONS (legacy)
		deliverSubject: "",
		deliverGroup: "",
		flowControl: false,
		idleHeartbeat: 0,
		headersOnly: false,

		/// ADVANCED
		inactiveThreshold: 0,
		numReplicas: 0,
		memStorage: false,
		metadata: {}
	}
}