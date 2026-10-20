import viewSetup, { ViewStore } from "@/stores/stacks/viewBase"
import { mixStores, StoreOf } from "@priolo/jon"



const setup = {

	state: {
		//#region VIEWBASE
		width: 215,
		pinnable: false,
		//#endregion
	},

	getters: {
		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) => "SHORTCUT",
		getSubTitle: (_: void, store?: ViewStore) => "Quick Access",
		getSerialization: (_: void, store?: ViewStore) => {
			const state = store.state as ShortcutState
			return {
				...viewSetup.getters.getSerialization(null, store),
			}
		},
		//#endregion
	},

	actions: {
	},

	mutators: {
	},
}

const shortcutSetup = mixStores(viewSetup, setup)
export interface ShortcutStore extends StoreOf<typeof shortcutSetup> {}
export type ShortcutState = ShortcutStore["state"]
export default shortcutSetup


