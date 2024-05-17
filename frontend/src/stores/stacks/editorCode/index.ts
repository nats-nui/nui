import { COLOR_VAR } from "@/stores/layout"
import viewSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { StoreCore, mixStores } from "@priolo/jon"



const setup = {

	state: {
		code: <string>null,

		//#region VIEWBASE
		colorVar: COLOR_VAR.CYAN,
		width: 420,
		widthMax: 1000,
		//#endregion
	},

	getters: {

		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) => "EDITOR CODE",
		getSubTitle: (_: void, store?: ViewStore) => "Semplice editor di testi",
		getSerialization: (_: void, store?: ViewStore) => {
			const state = store.state as EditorCodeState
			return {
				...viewSetup.getters.getSerialization(null, store),
				code: state.code,
				//format: state.format,
			}
		},
		//#endregion

	},

	actions: {

		//#region VIEWBASE
		setSerialization: (data: any, store?: ViewStore) => {
			viewSetup.actions.setSerialization(data, store)
			const state = store.state as EditorCodeState
			state.code = data.code
			//state.format = data.format
		},
		//#endregion

	},

	mutators: {
	},
}

export type EditorCodeState = typeof setup.state & ViewState
export type EditorCodeGetters = typeof setup.getters
export type EditorCodeActions = typeof setup.actions
export type EditorCodeMutators = typeof setup.mutators
export interface EditorCodeStore extends ViewStore, StoreCore<EditorCodeState>, EditorCodeGetters, EditorCodeActions, EditorCodeMutators {
	state: EditorCodeState
}
const editCodeSetup = mixStores(viewSetup, setup)
export default editCodeSetup


