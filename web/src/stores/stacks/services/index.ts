import docsSo from "@/stores/docs"
import docSetup, { ViewState, ViewStore } from "@/stores/docs/docBase"
import { Connection, DOC_TYPE } from "@/types"
import { StoreCore, mixStores } from "@priolo/jon"
import { initView } from "../../docs/utils/factory"
import { CnnViewStore } from "../connection"
import { PARAMS_MESSAGES } from "../messages"



const setup = {

	state: {
		connection: <Connection>null,
		draggable: false,
	},

	getters: {
	},

	actions: {
		openMessages(_: void, store?: ServicesStore) {
			const cnnId = (store.state.parent as CnnViewStore).getSelectId()
			if (!cnnId) return
			const msgStore = initView({
				type: DOC_TYPE.MESSAGES,
				params: { [PARAMS_MESSAGES.CONNECTION_ID]: [cnnId] }
			})
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

export type ServicesState = typeof setup.state & ViewState
export type ServicesGetters = typeof setup.getters
export type ServicesActions = typeof setup.actions
export type ServicesMutators = typeof setup.mutators
export interface ServicesStore extends ViewStore, StoreCore<ServicesState>, ServicesGetters, ServicesActions, ServicesMutators {
	state: ServicesState
}
const srvSetup = mixStores(docSetup, setup)
export default srvSetup
