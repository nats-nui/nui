import srcIcon from "@/assets/MessageIcon.svg"
import viewSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
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
		getSerialization: (_: void, store?: ViewStore) => {
			const state = store.state as MessageState
			return {
				...viewSetup.getters.getSerialization(null, store),
				message: state.message,
				format: state.format,
			}
		},
		//#endregion
		
	},

	actions: {

		//#region VIEWBASE
		setSerialization: (data: any, store?: ViewStore) => {
			viewSetup.actions.setSerialization(data, store)
			const state = store.state as MessageState
			state.message = data.message
			state.format = data.format
		},
		//#endregion

	},

	mutators: {
		setFormat: (format: MSG_FORMAT) => ({ format }),
		setFormatsOpen: (formatsOpen: boolean) => ({ formatsOpen }),
	},
}

export type MessageState = typeof setup.state & ViewState
export type MessageGetters = typeof setup.getters
export type MessageActions = typeof setup.actions
export type MessageMutators = typeof setup.mutators
export interface MessageStore extends ViewStore, StoreCore<MessageState>, MessageGetters, MessageActions, MessageMutators {
	state: MessageState
}
const msgSetup = mixStores(viewSetup, setup)
export default msgSetup
