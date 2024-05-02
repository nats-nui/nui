import { COLOR_VAR } from "@/stores/layout"
import viewSetup, { ViewStore } from "@/stores/stacks/viewBase"
import { About } from "@/types/About"
import { StoreCore, mixStores } from "@priolo/jon"
import { ViewState } from "../viewBase"



const setup = {

	state: {

		//#region VIEWBASE
		width: 300,
		colorVar: COLOR_VAR.GENERIC,
		pinnable: false,
		//#endregion
	},

	getters: {
		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) => "HELP",
		getSubTitle: (_: void, store?: ViewStore) => "Tutorial",
		//#endregion
	},

	actions: {

		//#region VIEWBASE
		//#endregion

	},

	mutators: {
		setAbout: (about: About) => ({ about }),
	},
}

export type HelpState = typeof setup.state & ViewState
export type HelpGetters = typeof setup.getters
export type HelpActions = typeof setup.actions
export type HelpMutators = typeof setup.mutators
export interface HelpStore extends ViewStore, StoreCore<HelpState>, HelpGetters, HelpActions, HelpMutators {
	state: HelpState
}
const helpSetup = mixStores(viewSetup, setup)
export default helpSetup


