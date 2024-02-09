import cnnSo from "@/stores/connections";
import { buildStore } from "@/stores/docs/utils/factory";
import { CnnDetailState, CnnDetailStore } from "@/stores/stacks/connection/detail";
import { MessagesState, MessagesStore } from "@/stores/stacks/messages";
import { Connection, DOC_TYPE, EDIT_STATE } from "@/types";



export function buildConnectionMessages(connectionId: string) {
	const cnn = cnnSo.getById(connectionId);
	if (!cnn) { console.error("no param"); return null; }
	const cnnMessageStore = buildStore({
		type: DOC_TYPE.MESSAGES,
		connectionId: cnn.id,
		subscriptions: [...(cnn?.subscriptions ?? [])]
	} as MessagesState) as MessagesStore;
	return cnnMessageStore;
}

export function buildConnectionNew() {
	const cnnStore = buildStore({
		type: DOC_TYPE.CONNECTION,
		editState: EDIT_STATE.NEW,
		connection: {
			name: "",
			hosts: [],
			subscriptions: [],
			auth: []
		}
	} as CnnDetailState) as CnnDetailStore;
	return cnnStore;
}

export function buildConnection(connection: Connection) {
	const cnnStore = buildStore({
		type: DOC_TYPE.CONNECTION,
		editState: EDIT_STATE.READ,
		connection
	} as CnnDetailState) as CnnDetailStore;
	return cnnStore;
}
