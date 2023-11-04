import docsSo from "@/stores/docs"
import docSetup, { ViewState, ViewStore } from "@/stores/docs/viewBase"
import { Connection, DOC_TYPE } from "@/types"
import { StoreCore, mixStores } from "@priolo/jon"
import { buildStore } from "../../docs/utils/factory"
import { CnnListStore } from "./list"
import { MessagesState, PARAMS_MESSAGES } from "../messages"



const setup = {

	state: {
		connection: <Connection>null,
		draggable: false,
	},

	getters: {
	},

	actions: {
		openMessages(_: void, store?: CnnDetailStore) {
			const cnnId = (store.state.parent as CnnListStore).getSelectId()
			if (!cnnId) return
			const msgStore = buildStore({
				type: DOC_TYPE.MESSAGES,
				params: { [PARAMS_MESSAGES.CONNECTION_ID]: [cnnId] },
				subscriptions: [...store.state.connection.subscriptions]
			} as MessagesState)
			docsSo.addLink({
				view: msgStore,
				parent: store,
			})
		},
	},

	mutators: {
		setConnection: (connection: Connection) => ({ connection })
	},
}

export type CnnDetailState = typeof setup.state & ViewState
export type CnnDetailGetters = typeof setup.getters
export type CnnDetailActions = typeof setup.actions
export type CnnDetailMutators = typeof setup.mutators
export interface CnnDetailStore extends ViewStore, StoreCore<CnnDetailState>, CnnDetailGetters, CnnDetailActions, CnnDetailMutators {
	state: CnnDetailState
}
const srvSetup = mixStores(docSetup, setup)
export default srvSetup
