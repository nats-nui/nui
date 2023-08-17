import docSetup, { ViewStore } from "@/stores/docs/doc"
import { StoreCore } from "@priolo/jon"
import { ViewState } from "../docs/doc"
import { mixStores } from "@priolo/jon"



export enum PARAMS_MESSAGES { 
	CONNECTION_ID = "cid"
}

const setup = {

	state: {
		params: {
			[PARAMS_MESSAGES.CONNECTION_ID]: <string[]>null
		}
	},

	getters: {
	},

	actions: {
	},

	mutators: {
	},
}

export type MessagesState = typeof setup.state & ViewState
export type MessagesGetters = typeof setup.getters
export type MessagesActions = typeof setup.actions
export type MEssagesMutators = typeof setup.mutators
export interface MessagesStore extends ViewStore, StoreCore<MessagesState>, MessagesGetters, MessagesActions, MEssagesMutators {
	state: MessagesState
}
const msgSetup = mixStores(docSetup, setup)
export default msgSetup
