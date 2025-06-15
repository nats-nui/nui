import viewSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { mixStores } from "@priolo/jon"



const setup = {

	state: {
		connectionId: <string>null,

		//#region VIEWBASE
		width: 340,
		//#endregion
	},

	getters: {

		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) => "METRICS",
		getSubTitle: (_: void, store?: ViewStore) => "Metrics for connection",
		getSerialization: (_: void, store?: ViewStore) => {
			const state = store.state as CnnMetricsState
			return {
				...viewSetup.getters.getSerialization(null, store),
				connectionId: state.connectionId,
			}
		},
		//#endregion

	},

	actions: {

		//#region VIEWBASE
		setSerialization: (data: any, store?: ViewStore) => {
			viewSetup.actions.setSerialization(data, store)
			const state = store.state as CnnMetricsState
			state.connectionId = data.connectionId
		},
		//#endregion

	},

	mutators: {
	},
}

export type CnnMetricsState = typeof setup.state & ViewState
export type CnnMetricsGetters = typeof setup.getters
export type CnnMetricsActions = typeof setup.actions
export type CnnMetricsMutators = typeof setup.mutators
export interface CnnMetricsStore extends ViewStore, CnnMetricsGetters, CnnMetricsActions, CnnMetricsMutators {
	state: CnnMetricsState
}
const cnnMetricsSetup = mixStores(viewSetup, setup)
export default cnnMetricsSetup
