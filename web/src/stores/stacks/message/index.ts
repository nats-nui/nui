import srcIcon from "@/assets/msg-hdr.svg"
import docSetup, { ViewState, ViewStore } from "@/stores/docs/viewBase"
import { StoreCore, mixStores } from "@priolo/jon"
import { HistoryMessage } from "../messages/utils"



const setup = {

	state: {
		message: <HistoryMessage>null
	},

	getters: {
		getTitle: (_: void, store?: ViewStore) => (store as MessageStore).state.message?.title,
		getIcon: (_: void, store?: ViewStore) => srcIcon,
	},

	actions: {
	},

	mutators: {
	},
}

export type MessageState = typeof setup.state & ViewState
export type MessageGetters = typeof setup.getters
export type MessageActions = typeof setup.actions
export type MEssageMutators = typeof setup.mutators
export interface MessageStore extends ViewStore, StoreCore<MessageState>, MessageGetters, MessageActions, MEssageMutators {
	state: MessageState
}
const msgSetup = mixStores(docSetup, setup)
export default msgSetup
