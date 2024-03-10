import { EditorRefProps } from "@/components/editor"
import { MSG_FORMAT } from "@/utils/editor"
import { StoreCore } from "@priolo/jon"
import { ViewState, ViewStore } from "./viewBase"



const loadBaseSetup = {

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

export type LoadBaseState = Partial<typeof loadBaseSetup.state> & ViewState
export type LoadBaseGetters = typeof loadBaseSetup.getters
export type LoadBaseActions = typeof loadBaseSetup.actions
export type LoadBaseMutators = typeof loadBaseSetup.mutators
export interface LoadBaseStore extends ViewStore, StoreCore<LoadBaseState>, LoadBaseGetters, LoadBaseActions, LoadBaseMutators {
	state: LoadBaseState
}

export default loadBaseSetup
