import { COLOR_VAR } from "@/stores/layout"
import viewSetup, { ViewStore } from "@/stores/stacks/viewBase"
import { StoreCore, mixStores } from "@priolo/jon"
import { ViewState } from "../viewBase"



const setup = {

	state: {
		//#region VIEWBASE
		width: 150,
		colorVar: COLOR_VAR.CYAN,
		pinnable: false,
		//#endregion
	},

	getters: {
		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) => "ABOUT",
		getSubTitle: (_: void, store?: ViewStore) => "App NUI",
		getSerialization: (_: void, store?: ViewStore) => {
			const state = store.state as AboutState
			return {
				...viewSetup.getters.getSerialization(null, store),
			}
		},
		//#endregion
	},

	actions: {
		//#region VIEWBASE
		setSerialization: (data: any, store?: ViewStore) => {
			viewSetup.actions.setSerialization(data, store)
		},
		//#endregion
	},

	mutators: {
	},
}

export type AboutState = typeof setup.state & ViewState
export type AboutGetters = typeof setup.getters
export type AboutActions = typeof setup.actions
export type AboutMutators = typeof setup.mutators
export interface AboutStore extends ViewStore, StoreCore<AboutState>, AboutGetters, AboutActions, AboutMutators {
	state: AboutState
}
const aboutSetup = mixStores(viewSetup, setup)
export default aboutSetup


