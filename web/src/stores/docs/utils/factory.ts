import cnnSetup, { ConnectionStore } from "@/stores/connection";
import messagesSetup, { MessagesStore } from "@/stores/messages";
import servicesSetup, { ServicesStore } from "@/stores/services";
import { DOC_TYPE } from "@/types";
import { createStore } from "@priolo/jon";
import { ViewState, ViewStore } from "../doc";


/** crea crea lo STORE adeguato */
export function initView(state: Partial<ViewState>): ViewStore {
	let store: ViewStore = null
	switch (state.type) {
		case DOC_TYPE.CONNECTIONS:
			store = createStore(cnnSetup) as ConnectionStore
			break
		case DOC_TYPE.SERVICES:
			store = createStore(servicesSetup) as ServicesStore
			break
		case DOC_TYPE.MESSAGES:
			store = createStore(messagesSetup) as MessagesStore
			break
		default:
			return
	}
	store.state = state
	return store
}
