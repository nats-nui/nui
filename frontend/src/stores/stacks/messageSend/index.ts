import cnnApi from "@/api/connection"
import cnnSo from "@/stores/connections"
import { COLOR_VAR } from "@/stores/layout"
import viewSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { StoreCore, mixStores } from "@priolo/jon"
import { editor } from "monaco-editor"
import { MSG_FORMAT } from "../messages/utils"



export const editorOptionsDefault: editor.IStandaloneEditorConstructionOptions = {
	//readOnly: true,
	//readOnlyMessage: "",
	wordWrap: "on",
	lineNumbers: 'off',
	glyphMargin: false,
	lineDecorationsWidth: 0,
	lineNumbersMinChars: 0,
	folding: false,
	showFoldingControls: "mouseover",
	minimap: {
		enabled: false,
	},
	tabSize: 2,
	parameterHints: {
		enabled: false,
	},
}

const setup = {

	state: {
		connectionId: <string>null,
		text: <string>null,
		subject: <string>null,
		subsOpen: false,

		//#region StoreMessageFormat
		format: MSG_FORMAT.JSON,
		formatsOpen: false,
		editorRef: null,
		//#endregion

		//#region VIEWBASE
		colorVar: COLOR_VAR.CYAN,
		//#endregion
	},

	getters: {

		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) => {
			const cnnId = (store.state as MessageSendState).connectionId
			const cnn = cnnSo.getById(cnnId)
			return cnn?.name ?? "..."
		},
		getSubTitle: (_: void, store?: ViewStore) => "SEND MESSAGE",
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

		//#region StoreMessageFormat
		setFormat: (format: MSG_FORMAT) => ({ format }),
		setFormatsOpen: (formatsOpen: boolean) => ({ formatsOpen }),
		//#endregion
	},
}

export type MessageSendState = typeof setup.state & ViewState
export type MessageSendGetters = typeof setup.getters
export type MessageSendActions = typeof setup.actions
export type MessageSendMutators = typeof setup.mutators
export interface MessageSendStore extends ViewStore, StoreCore<MessageSendState>, MessageSendGetters, MessageSendActions, MessageSendMutators {
	state: MessageSendState
}
const msgSetup = mixStores(viewSetup, setup)
export default msgSetup
