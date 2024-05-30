import { EditorRefProps } from "@/components/editor"
import { MSG_FORMAT } from "@/utils/editor"
import { StoreCore } from "@priolo/jon"
import { ViewState, ViewStore } from "./viewBase"
import docsSo from "../docs"

let autoformat:boolean = false

const editorSetup = {

	state: {
		format: MSG_FORMAT.JSON,
		formatsOpen: false,
		editorRef: <EditorRefProps>null,
	},

	getters: {
		getEditorText: (_:void, store?:ViewStore ) => "<OVERWRITE>",
		getAutoFormat: (_:void, store?:ViewStore ) => autoformat
	},

	actions: {
		setAutoFormat: (value: boolean, store?:EditorStore ) => {
			autoformat = value
			store._update()
		},
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
