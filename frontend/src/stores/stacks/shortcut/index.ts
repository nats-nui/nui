import viewSetup, { ViewStore } from "@/stores/stacks/viewBase"
import { mixStores, StoreCore } from "@priolo/jon"
import { ViewState } from "../viewBase"



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

export type ShortcutState = typeof setup.state & ViewState
type ShortcutGetters = typeof setup.getters
type ShortcutActions = typeof setup.actions
type ShortcutMutators = typeof setup.mutators
export interface ShortcutStore extends ViewStore, StoreCore<ShortcutState>, ShortcutGetters, ShortcutActions, ShortcutMutators {
	state: ShortcutState
}
const shortcutSetup = mixStores(viewSetup, setup)
export default shortcutSetup


