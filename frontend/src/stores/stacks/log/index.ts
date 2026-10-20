import { Log } from "@/stores/log/utils"
import viewSetup, { ViewStore } from "@/stores/stacks/viewBase"
import { mixStores, StoreOf } from "@priolo/jon"
import { focusSo } from "@priolo/jack"



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
			focusSo.focus(store.state.group.getById(log.targetId))
		},
	},

	mutators: {
	},
}

const msgSetup = mixStores(viewSetup, setup)
export interface ViewLogStore extends StoreOf<typeof msgSetup> {}
export type ViewLogState = ViewLogStore["state"]
export default msgSetup


