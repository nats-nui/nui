import { EditorRefProps } from "@/components/editor"
import { MSG_FORMAT } from "@/utils/editor"
import { StoreCore } from "@priolo/jon"
import { ViewState, ViewStore } from "./viewBase"



const editorSetup = {

	state: {
		format: MSG_FORMAT.JSON,
		formatsOpen: false,
		editorRef: <EditorRefProps>null,
	},

	getters: {
		getEditorText: (_:void, store?:ViewStore ):string => "<OVERWRITE>"
	},

	actions: {
		
	},

	mutators: {
		setFormat: (format: MSG_FORMAT) => ({ format }),
		setFormatsOpen: (formatsOpen: boolean) => ({ formatsOpen }),
	},
}

export type EditorState = Partial<typeof editorSetup.state> & ViewState
export type EditorGetters = typeof editorSetup.getters
export type EditorActions = typeof editorSetup.actions
export type EditorMutators = typeof editorSetup.mutators
export interface EditorStore extends ViewStore, StoreCore<EditorState>, EditorGetters, EditorActions, EditorMutators {
	state: EditorState
}

export default editorSetup
