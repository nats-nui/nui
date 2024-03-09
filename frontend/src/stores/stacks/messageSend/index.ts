import cnnApi from "@/api/connection"
import cnnSo from "@/stores/connections"
import { COLOR_VAR } from "@/stores/layout"
import viewSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { StoreCore, mixStores } from "@priolo/jon"
import editorSetup, { EditorState, EditorStore } from "../editorBase"



const setup = {

	state: {
		connectionId: <string>null,
		text: <string>null,
		subject: <string>null,
		subsOpen: false,

		//#region VIEWBASE
		colorVar: COLOR_VAR.CYAN,
		width: 420,
		//#endregion
	},

	getters: {

		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) => "SEND MESSAGE",
		getSubTitle: (_: void, store?: ViewStore) => {
			const cnnId = (store.state as MessageSendState).connectionId
			const cnn = cnnSo.getById(cnnId)
			return cnn?.name ?? "--"
		},
		getSerialization: (_: void, store?: ViewStore) => {
			const state = store.state as MessageSendState
			return {
				...viewSetup.getters.getSerialization(null, store),
				connectionId: state.connectionId,
				text: state.text,
				subject: state.subject,
			}
		},
		//#endregion

		getEditorText: (_: void, store?: ViewStore) => (<MessageSendStore>store).state.text ?? ""
	},

	actions: {

		//#region VIEWBASE
		setSerialization: (data: any, store?: ViewStore) => {
			viewSetup.actions.setSerialization(data, store)
			const state = store.state as MessageSendState
			state.connectionId = data.connectionId
			state.text = data.text
			state.subject = data.subject
		},
		//#endregion

		publish: (_: void, store?: MessageSendStore) => {
			cnnApi.publish(
				store.state.connectionId,
				store.state.subject,
				store.state.text
			)
		},

	},

	mutators: {
		setText: (text: string, store?: MessageSendStore) => ({ text }),
		setSubject: (subject: string) => ({ subject }),
		setSubsOpen: (subsOpen: boolean) => ({ subsOpen }),
	},
}

export type MessageSendState = typeof setup.state & ViewState & EditorState
export type MessageSendGetters = typeof setup.getters
export type MessageSendActions = typeof setup.actions
export type MessageSendMutators = typeof setup.mutators
export interface MessageSendStore extends ViewStore, EditorStore, StoreCore<MessageSendState>, MessageSendGetters, MessageSendActions, MessageSendMutators {
	state: MessageSendState
}
const msgSetup = mixStores(viewSetup, editorSetup, setup)
export default msgSetup
