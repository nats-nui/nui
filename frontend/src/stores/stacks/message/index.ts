import { COLOR_VAR } from "@/stores/layout"
import viewSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { Message } from "@/types/Message"
import { StoreCore, mixStores } from "@priolo/jon"
import { editor } from "monaco-editor"
import { MSG_FORMAT } from "../messages/utils"



const editorOptionsDefault: editor.IStandaloneEditorConstructionOptions = {
	//readOnly: true,
	//readOnlyMessage: "",
	wordWrap: "on",
	lineNumbers: 'off',
	glyphMargin: false,
	lineDecorationsWidth: 0,
	lineNumbersMinChars: 0,
	folding: true,
	showFoldingControls: "mouseover",
	minimap: {
		enabled: false,
	},
	tabSize: 2,
}

const setup = {

	state: {
		message: <Message>null,
		format: MSG_FORMAT.JSON,
		formatsOpen: false,
		editor: editorOptionsDefault,

		//#region VIEWBASE
		urlSerializable: false,
		width: 420,
		colorVar: COLOR_VAR.CYAN,
		//#endregion
	},

	getters: {

		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) =>  (store as MessageStore).state.message?.subject,
		getSubTitle: (_: void, store?: ViewStore): string => "MESSAGE",
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
		setEditor: (editor: editor.IStandaloneEditorConstructionOptions) => ({ editor }),
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


