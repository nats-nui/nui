import docsSo from "@/stores/docs"
import docSetup, { ViewState, ViewStore } from "@/stores/docs/docBase"
import { Connection, DOC_TYPE, Subscription } from "@/types"
import { StoreCore, mixStores } from "@priolo/jon"
import { ConnectionStore } from "../connection"
import { initView } from "../docs/utils/factory"
import { PARAMS_MESSAGES } from "../messages"



const setup = {

	state: {
		connection: <Connection>null,
	},

	getters: {
	},

	actions: {
		openMessages(_:void, store?: ServicesStore) {
			const cnnId = (store.state.parent as ConnectionStore).getSelect()?.id
			if ( !cnnId ) return 
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
