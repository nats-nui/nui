import servicesSetup from "@/stores/stacks/connection/detail";
import cnnSetup from "@/stores/stacks/connection/list";
import messageSetup, { MessageState } from "@/stores/stacks/message";
import messagesSetup, { MessagesState, MessagesStore } from "@/stores/stacks/messages";
import messageSendSetup from "@/stores/stacks/send";
import streamsSetup from "@/stores/stacks/streams";
import streamSetup from "@/stores/stacks/streams/detail";
import logsSetup from "@/stores/stacks/mainLogs";
import { DOC_TYPE } from "@/types";
import { createStore } from "@priolo/jon";
import { ViewState, ViewStore } from "../../stacks/viewBase";
import consumerSetup from "@/stores/stacks/consumer/detail";
import consumersSetup, { ConsumersState, ConsumersStore } from "@/stores/stacks/consumer";
import streamMessagesSetup from "@/stores/stacks/streams/messages";
import { StreamMessagesState, StreamMessagesStore } from "@/stores/stacks/streams/messages";
import { StreamInfo } from "@/types/Stream";
import { Message } from "@/types/Message";
import { MSG_FORMAT } from "@/stores/stacks/messages/utils";
import cnnSo from "@/stores/connections"



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

//#region  CONNECTION

export function buildConnectionMessages(connectionId: string) {
	const cnn = cnnSo.getById(connectionId)
	if (!cnn) { console.error("no param"); return null }
	const cnnMessageStore = buildStore({
		type: DOC_TYPE.MESSAGES,
		connectionId: cnn.id,
		subscriptions: [...(cnn?.subscriptions ?? [])]
	} as MessagesState) as MessagesStore
	return cnnMessageStore
}

export function buildStreams(connectionId: string) {
	const cnn = cnnSo.getById(connectionId)
	if (!cnn) { console.error("no param"); return null }
	const streamsStore = buildStore({
		type: DOC_TYPE.STREAMS,
		connectionId: cnn.id,
		subscriptions: [...(cnn?.subscriptions ?? [])]
	} as MessagesState) as MessagesStore
	return streamsStore
}

//#endregion


//#region STREAM

export function buildConsumers(connectionId: string, stream: Partial<StreamInfo>) {
	if (!stream?.config?.name || !connectionId) { console.error("no param"); return null }
	const consumerStore = buildStore({
		type: DOC_TYPE.CONSUMERS,
		connectionId: connectionId,
		streamName: stream.config.name,
	} as ConsumersState) as ConsumersStore
	return consumerStore
}

export function buildStreamMessages(connectionId: string, stream: Partial<StreamInfo>) {
	if (!stream?.config?.name || !connectionId) { console.error("no param"); return null }
	const streamMessagesStore = buildStore({
		type: DOC_TYPE.STREAM_MESSAGES,
		connectionId,
		stream,
	} as StreamMessagesState) as StreamMessagesStore
	return streamMessagesStore
}

//#endregion

export function buildMessageDetail(message: Message, format: MSG_FORMAT) {
	if (!message ) { console.error("no param"); return null }
	const msgStore = buildStore({
		type: DOC_TYPE.MESSAGE,
		message,
		format,
	} as MessageState)
	return msgStore
}
