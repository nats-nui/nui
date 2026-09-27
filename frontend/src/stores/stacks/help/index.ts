import viewSetup, { ViewStore } from "@/stores/stacks/viewBase"
import { About } from "@/types/About"
import { mixStores, StoreOf } from "@priolo/jon"



const setup = {

	state: {

		//#region VIEWBASE
		width: 300,
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

const helpSetup = mixStores(viewSetup, setup)
export interface HelpStore extends StoreOf<typeof helpSetup> {}
export type HelpState = HelpStore["state"]
export default helpSetup


