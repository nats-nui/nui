import { COLOR_VAR } from "@/stores/layout"
import viewSetup, { ViewStore } from "@/stores/stacks/viewBase"
import { StoreCore, mixStores } from "@priolo/jon"
import { ViewState } from "../viewBase"
import aboutApi from "@/api/about"
import { About } from "@/types/About"



const setup = {

	state: {

		about: <About>null,

		//#region VIEWBASE
		width: 150,
		colorVar: COLOR_VAR.GENERIC,
		pinnable: false,
		
		//#endregion
	},

	getters: {
		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) => "HELP",
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

		async fetch(_: void, store?: AboutStore) {
			const about = await aboutApi.get({ store })
			store.setAbout(about)
		},

		async fetchIfVoid(_: void, store?: AboutStore) {
			if (!!store.state.about) return
			await store.fetch()
		},
	},

	mutators: {
		setAbout: (about: About) => ({ about }),
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


