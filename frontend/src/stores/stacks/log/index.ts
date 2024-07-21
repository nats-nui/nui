import { Log } from "@/stores/log/utils"
import viewSetup, { ViewStore } from "@/stores/stacks/viewBase"
import { StoreCore, mixStores } from "@priolo/jon"
import { ViewState } from "../viewBase"



const setup = {

	state: {
		//#region VIEWBASE
		pinnable: false,
		//#endregion
	},

	getters: {
		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) => "LOGS",
		getSubTitle: (_: void, store?: ViewStore) => "System messages",
		getSerialization: (_: void, store?: ViewStore) => {
			const state = store.state as ViewLogState
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

		select (log:Log, store?:ViewLogStore ) {
			store.state.group.focus(store.state.group.getById(log.targetId))
		},
	},

	mutators: {
	},
}

export type ViewLogState = typeof setup.state & ViewState
export type ViewLogGetters = typeof setup.getters
export type ViewLogActions = typeof setup.actions
export type ViewLogMutators = typeof setup.mutators
export interface ViewLogStore extends ViewStore, StoreCore<ViewLogState>, ViewLogGetters, ViewLogActions, ViewLogMutators {
	state: ViewLogState
}
const msgSetup = mixStores(viewSetup, setup)
export default msgSetup


