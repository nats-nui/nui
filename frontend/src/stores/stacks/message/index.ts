import { COLOR_VAR } from "@/stores/layout"
import viewSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { Message } from "@/types/Message"
import { StoreCore, mixStores } from "@priolo/jon"
import editorSetup, { EditorState, EditorStore } from "../editorBase"



const setup = {

	state: {
		message: <Message>null,

		//#region VIEWBASE
		colorVar: COLOR_VAR.CYAN,
		width: 420,
		widthMax: 1000,
		//#endregion
	},

	getters: {

		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) => "MESSAGE DETAIL",
		getSubTitle: (_: void, store?: ViewStore): string => (store as MessageStore).state.message?.subject ?? "--",
		// 	const timestamp = (store as MessageStore).state.message?.receivedAt
		// 	return !!timestamp ? dayjs(timestamp).format("YYYY-MM-DD HH:mm:ss") : ""
		// },
		getSerialization: (_: void, store?: ViewStore) => {
			const state = store.state as MessageState
			return {
				...viewSetup.getters.getSerialization(null, store),
				message: state.message,
				format: state.format,
			}
		},
		//#endregion

		getEditorText: (_: void, store?: ViewStore) => (<MessageStore>store).state.message?.payload ?? ""
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
	},
}

export type MessageState = typeof setup.state & ViewState & EditorState
export type MessageGetters = typeof setup.getters
export type MessageActions = typeof setup.actions
export type MessageMutators = typeof setup.mutators
export interface MessageStore extends ViewStore, EditorStore, StoreCore<MessageState>, MessageGetters, MessageActions, MessageMutators {
	state: MessageState
}
const msgSetup = mixStores(viewSetup, editorSetup, setup)
export default msgSetup


