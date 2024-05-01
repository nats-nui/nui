import { COLOR_VAR } from "@/stores/layout"
import viewSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { StoreCore, mixStores } from "@priolo/jon"
import editorSetup, { EditorState } from "../editorBase"
import { withReact } from "slate-react"
import { createEditor } from "slate"



const setup = {

	state: () => {
		return {
			editor: withReact(createEditor()),
			content: <string>null,
			//#region VIEWBASE
			colorVar: COLOR_VAR.CYAN,
			width: 420,
			widthMax: 1000,
			//#endregion
		}
	},

	getters: {

		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) => "EDITOR",
		getSubTitle: (_: void, store?: ViewStore) => "Editor",
		getSerialization: (_: void, store?: ViewStore) => {
			const state = store.state as TextEditorState
			return {
				...viewSetup.getters.getSerialization(null, store),
				content: state.content,
			}
		},
		//#endregion

	},

	actions: {

		//#region VIEWBASE
		setSerialization: (data: any, store?: ViewStore) => {
			viewSetup.actions.setSerialization(data, store)
			const state = store.state as TextEditorState
			state.content = data.content
		},
		//#endregion

	},

	mutators: {
	},
}

export type TextEditorState = ReturnType<typeof setup.state> & ViewState & EditorState
//export type TextEditorState = typeof setup.state & ViewState & EditorState
export type TextEditorGetters = typeof setup.getters
export type TextEditorActions = typeof setup.actions
export type TextEditorMutators = typeof setup.mutators
export interface TextEditorStore extends ViewStore, StoreCore<TextEditorState>, TextEditorGetters, TextEditorActions, TextEditorMutators {
	state: TextEditorState
}
const txtEditorSetup = mixStores(viewSetup, editorSetup, setup)
export default txtEditorSetup


