import docsSo from "@/stores/docs"
import docSetup, { ViewState, ViewStore } from "@/stores/docs/doc"
import { Connection, DOC_TYPE, Service } from "@/types"
import { StoreCore, mixStores } from "@priolo/jon"
import { ConnectionStore } from "../connection"
import { initView } from "../docs/utils/factory"
import { PARAMS_MESSAGES } from "../messages"



const setup = {

	state: {
		connection: <Connection>null,
	},

	getters: {
		getServices(_: void, store?: ServicesStore): Service[] {
			return [
				{ name: "MESSAGES" },
				{ name: "DATABASES" },
				{ name: "SETTINGS" },
			]
		}
	},

	actions: {
		select(service: Service, store?: ServicesStore) {
			const cnnId = (store.state.parent as ConnectionStore).getSelect()?.id ?? -1
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
