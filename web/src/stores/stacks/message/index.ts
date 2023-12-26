import srcIcon from "@/assets/message-icon.svg"
import docSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { StoreCore, mixStores } from "@priolo/jon"
import { HistoryMessage, MSG_FORMAT } from "../messages/utils"
import { COLOR_VAR } from "@/stores/layout"
import dayjs from "dayjs"



const setup = {

	state: {
		message: <HistoryMessage>null,
		format: MSG_FORMAT.JSON,
		formatsOpen: false,
		
		//#region VIEWBASE
		urlSerializable: false,
		width: 320,
		//#endregion
	},

	getters: {
		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) => (store as MessageStore).state.message?.title,
		getSubTitle: (_: void, store?: ViewStore):string => {
			const timestamp = (store as MessageStore).state.message?.timestamp
			return !!timestamp ? dayjs(timestamp).format("YYYY-MM-DD HH:mm:ss") : ""
		},
		getIcon: (_: void, store?: ViewStore) => srcIcon,
		getColorVar: (_: void, store?: ViewStore) => COLOR_VAR.CYAN,
		//#endregion
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
