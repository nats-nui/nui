import servicesSetup from "@/stores/stacks/connection/detail";
import cnnSetup from "@/stores/stacks/connection";
import messageSetup, { MessageState } from "@/stores/stacks/message";
import messagesSetup from "@/stores/stacks/messages";
import messageSendSetup from "@/stores/stacks/send";
import streamsSetup from "@/stores/stacks/streams";
import streamSetup from "@/stores/stacks/streams/detail";
import logsSetup from "@/stores/stacks/mainLogs";
import { DOC_TYPE } from "@/types";
import { createStore } from "@priolo/jon";
import { ViewState, ViewStore } from "../../stacks/viewBase";
import consumerSetup, { ConsumerState, ConsumerStore } from "@/stores/stacks/consumer/detail";
import consumersSetup, { ConsumersState, ConsumersStore } from "@/stores/stacks/consumer";
import streamMessagesSetup from "@/stores/stacks/streams/messages";
import { StreamInfo } from "@/types/Stream";
import { Message } from "@/types/Message";
import { MSG_FORMAT } from "@/stores/stacks/messages/utils";
import cnnSo from "@/stores/connections"
import bucketSetup, { BucketStatus, BucketStore } from "@/stores/stacks/buckets/detail";
import { BucketConfig, BucketState } from "@/types/Bucket";
import kventriesSetup, { KVEntriesState, KVEntriesStore } from "@/stores/stacks/kventry";
import kventrySetup, { KVEntryState, KVEntryStore } from "@/stores/stacks/kventry/detail";
import bucketsSetup, { BucketsState, BucketsStore } from "@/stores/stacks/buckets";
import { KVEntry } from "@/types/KVEntry";
import { StreamConsumer } from "@/types/Consumer";



/** genera un uuid per un DOC */
export function createUUID(): string {
	var dt = new Date().getTime();
	var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
		/[xy]/g,
		(c) => {
			let r = (dt + (Math.random() * 16)) % 16 | 0;
			dt = Math.floor(dt / 16);
			return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
		}
	)
	return uuid;
}

/** crea lo STORE adeguato */
export function buildStore(state: Partial<ViewState>): ViewStore {
	const setup = {
		[DOC_TYPE.CONNECTIONS]: cnnSetup,
		[DOC_TYPE.CONNECTION]: servicesSetup,

		[DOC_TYPE.MESSAGES]: messagesSetup,
		[DOC_TYPE.MESSAGE]: messageSetup,
		[DOC_TYPE.MESSAGE_SEND]: messageSendSetup,

		[DOC_TYPE.STREAMS]: streamsSetup,
		[DOC_TYPE.STREAM]: streamSetup,
		[DOC_TYPE.STREAM_MESSAGES]: streamMessagesSetup,

		[DOC_TYPE.BUCKETS]: bucketsSetup,
		[DOC_TYPE.BUCKET]: bucketSetup,
		[DOC_TYPE.KVENTRIES]: kventriesSetup,
		[DOC_TYPE.KVENTRY]: kventrySetup,

		[DOC_TYPE.CONSUMERS]: consumersSetup,
		[DOC_TYPE.CONSUMER]: consumerSetup,

		[DOC_TYPE.LOGS]: logsSetup,
	}[state.type]
	if (!setup) return
	const store: ViewStore = <ViewStore>createStore(setup)
	store.state = { ...store.state, ...state }
	// se non c'e' l'uuid lo creo IO!
	if (store.state.uuid == null) store.state.uuid = createUUID()
	store.onCreate()
	return store
}



//#endregion



//#region BUCKET

export function buildBuckets(connectionId: string) {
	const cnn = cnnSo.getById(connectionId)
	if (!cnn) { console.error("no param"); return null }
	const bucketsStore = buildStore({
		type: DOC_TYPE.BUCKETS,
		connectionId: cnn.id,
	} as BucketsState) as BucketsStore
	return bucketsStore
}

export function buildBucket(connectionId: string, bucket: Partial<BucketState>) {
	if (!connectionId) { console.error("no param"); return null }
	const bucketStore = buildStore({
		type: DOC_TYPE.BUCKET,
		connectionId,
		bucket,
	} as BucketStatus) as BucketStore
	return bucketStore
}
export function buildBucketNew(connectionId: string, bucketConfig: BucketConfig) {
	if (!connectionId || !bucketConfig) { console.error("no param"); return null }
	const bucketStore = buildStore({
		type: DOC_TYPE.BUCKET,
		connectionId,
		bucketConfig,
	} as BucketStatus) as BucketStore
	return bucketStore
}

export function buildKVEntries(connectionId: string, bucket: BucketState) {
	if (!bucket || !connectionId) { console.error("no param"); return null }
	const bucketsStore = buildStore({
		type: DOC_TYPE.KVENTRIES,
		connectionId: connectionId,
		bucket,
	} as KVEntriesState) as KVEntriesStore
	return bucketsStore
}

export function buildKVEntry(connectionId: string, bucket: Partial<BucketState>, kventry: KVEntry) {
	if (!bucket || !connectionId) { console.error("no param"); return null }
	const store = buildStore({
		type: DOC_TYPE.KVENTRY,
		connectionId,
		bucket,
		kventry,
	} as KVEntryState) as KVEntryStore
	return store
}

export function buildKVEntryNew(connectionId: string, bucket: Partial<BucketState>) {
	if (!bucket || !connectionId) { console.error("no param"); return null }
	const store = buildStore({
		type: DOC_TYPE.KVENTRY,
		connectionId,
		bucket,
		kventry: { key: "", payload: "" },
		readOnly: false,
		isNew: true,
	} as KVEntryState) as KVEntryStore
	return store
}

//#endregion



//#region CONSUMER

export function buildConsumer(connectionId: string, streamName: string, consumer: StreamConsumer) {
	if (!connectionId || !streamName || !consumer) { console.error("no param"); return null }
	const consumerStore = buildStore({
		type: DOC_TYPE.CONSUMER,
		connectionId: connectionId,
		streamName: streamName,
		consumer,
	} as ConsumerState) as ConsumerStore
	return consumerStore
}

export function buildConsumers(connectionId: string, stream: Partial<StreamInfo>) {
	if (!stream?.config?.name || !connectionId) { console.error("no param"); return null }
	const consumerStore = buildStore({
		type: DOC_TYPE.CONSUMERS,
		connectionId: connectionId,
		streamName: stream.config.name,
	} as ConsumersState) as ConsumersStore
	return consumerStore
}

//#endregion



//#region MESSAGES

export function buildMessageDetail(message: Message, format: MSG_FORMAT) {
	if (!message) { console.error("no param"); return null }
	const msgStore = buildStore({
		type: DOC_TYPE.MESSAGE,
		message,
		format,
	} as MessageState)
	return msgStore
}

//#endregion
