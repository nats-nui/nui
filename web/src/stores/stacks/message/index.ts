import srcIcon from "@/assets/msg-hdr.svg"
import docSetup, { ViewState, ViewStore } from "@/stores/docs/viewBase"
import { StoreCore, mixStores } from "@priolo/jon"
import { HistoryMessage, MSG_FORMAT } from "../messages/utils"



const setup = {

	state: {
		message: <HistoryMessage>null,
		format: MSG_FORMAT.JSON,
		formatsOpen: false,
	},

	getters: {
		getTitle: (_: void, store?: ViewStore) => (store as MessageStore).state.message?.title,
		getIcon: (_: void, store?: ViewStore) => srcIcon,
	},

	actions: {
	},

	mutators: {
		setFormat: (format: MSG_FORMAT) => ({ format }),
		setFormatsOpen: (formatsOpen: boolean) => ({ formatsOpen }),
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
