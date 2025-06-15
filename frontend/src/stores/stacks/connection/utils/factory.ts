import cnnSo, { ConnectionState } from "@/stores/connections";
import { buildStore } from "@/stores/docs/utils/factory";
import { CnnDetailState, CnnDetailStore } from "@/stores/stacks/connection/detail";
import { MessagesState, MessagesStore } from "@/stores/stacks/connection/messages";
import { AUTH_MODE, Connection, DOC_TYPE, EDIT_STATE } from "@/types";
import { VIEW_SIZE } from "../../utils";
import { MessageSendState, MessageSendStore } from "../messageSend";
import { SyncState, SyncStore } from "../../sync";
import { CnnMetricsState, CnnMetricsStore } from "../metrics";



export function buildConnectionMessages(connectionId: string) {
	const cnn = cnnSo.getById(connectionId);
	if (!cnn) { console.error("no param"); return null; }
	const cnnMessageStore = buildStore({
		type: DOC_TYPE.MESSAGES,
		connectionId: cnn.id,
	} as MessagesState) as MessagesStore
	return cnnMessageStore;
}

export function buildConnectionSync(connectionId: string) {
	const cnn = cnnSo.getById(connectionId);
	if (!cnn) { console.error("no param"); return null; }
	const cnnSyncStore = buildStore({
		type: DOC_TYPE.SYNC,
		connectionId: cnn.id,
	} as SyncState) as SyncStore
	return cnnSyncStore
}


export function buildConnectionNew() {
	const cnnStore = buildStore({
		type: DOC_TYPE.CONNECTION,
		editState: EDIT_STATE.NEW,
		size: VIEW_SIZE.NORMAL,
		sizeForce: true,
		connection: {
			name: "",
			hosts: [],
			subscriptions: [],
			auth: [],
			// metrics: {
			// 	httpSource: { active: false, url: "" },
			// 	natsSource: { active: false, auth: { mode: AUTH_MODE.TOKEN } },
			// },
		}
	} as CnnDetailState) as CnnDetailStore;
	return cnnStore;
}

export function buildConnection(state:Partial<CnnDetailState>) {
	const cnnStore = buildStore({
		type: DOC_TYPE.CONNECTION,
		editState: EDIT_STATE.READ,
		...state,
	} as CnnDetailState) as CnnDetailStore;
	return cnnStore;
}

export function buildConnectionMessageSend(connectionId: string, subjects: string[] = []) {
	const sendStore = buildStore({
		type: DOC_TYPE.MESSAGE_SEND,
		connectionId: connectionId,
		subjects,
	} as MessageSendState) as MessageSendStore
	return sendStore;
}

export function buildConnectionMetrics(connectionId: string) {
	const store = buildStore({
		type: DOC_TYPE.CNN_METRICS,
		connectionId: connectionId,
	} as CnnMetricsState) as CnnMetricsStore
	return store;
}