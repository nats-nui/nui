import { EditorRefProps } from "@/components/editor"
import { MSG_FORMAT } from "@/utils/editor"
import { StoreCore } from "@priolo/jon"
import { ViewState, ViewStore } from "./viewBase"



// let autoFormat: boolean = false
// let format: MSG_FORMAT = MSG_FORMAT.JSON

const editorSetup = {

	// state: () => {
	// 	return {
	// 		format,
	// 		formatsOpen: false,
	// 		editorRef: <EditorRefProps>null,
	// 		autoFormat,
	// 	}
	// },
	state: {
		format: MSG_FORMAT.JSON,
		formatsOpen: false,
		editorRef: <EditorRefProps>null,
		autoFormat: false,
	},

	getters: {
		getEditorText: (_: void, store?: ViewStore) => "<OVERWRITE>",
		// getAutoFormat: (_: void, store?: EditorStore) => {
		// 	//if (store.state.autoFormat == null) store.state.autoFormat = autoFormat
		// 	return store.state.autoFormat
		// }
	},

	actions: {
		// setAutoFormat: (value: boolean, store?:EditorStore ) => {
		// 	autoformat = value
		// 	store._update()
		// },
	},

	mutators: {
		setFormat: (value: MSG_FORMAT) => {
			//format = value
			return { format: value }
		},
		setFormatsOpen: (formatsOpen: boolean) => ({ formatsOpen }),
		setAutoFormat: (value: boolean, store?: EditorStore) => {
			//autoFormat = value
			return { autoFormat: value }
		},

	},
}

//export type EditorState = ReturnType<typeof editorSetup.state> & ViewState
export type EditorState = Partial<typeof editorSetup.state> & ViewState
export type EditorGetters = typeof editorSetup.getters
export type EditorActions = typeof editorSetup.actions
export type EditorMutators = typeof editorSetup.mutators
export interface EditorStore extends ViewStore, StoreCore<EditorState>, EditorGetters, EditorActions, EditorMutators {
	state: EditorState
}

export default editorSetup
