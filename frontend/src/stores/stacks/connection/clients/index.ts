import cnnSo from "@/stores/connections"
import metricsSo from "@/stores/connections/metrics"
import viewSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { mixStores } from "@priolo/jon"
import { SORTABLE_PROPERTIES } from "./types"



const setup = {

	state: {
		connectionId: <string>null,
		textSearch: "",
		sort: SORTABLE_PROPERTIES.CID,
		sortOpen: false,

		//#region VIEWBASE
		width: 460,
		//#endregion
	},

	getters: {

		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) => "CLIENTS",
		getSubTitle: (_: void, store?: ViewStore) => cnnSo.getById((<ClientMetricsStore>store).state.connectionId)?.name ?? "--",
		getSerialization: (_: void, store?: ViewStore) => {
			const state = store.state as ClientMetricsState
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
			const state = store.state as ClientMetricsState
			state.connectionId = data.connectionId
		},
		//#endregion

		async onCreated(_: void, store?: ClientMetricsStore) {
			metricsSo.enable(store.state.connectionId)
		},
//[ II ] non viene chiamata quando elimino il parent
		onRemoval(_: void, store?: ViewStore) {
			metricsSo.disable((<ClientMetricsStore>store).state.connectionId)
		},

	},

	mutators: {
		setTextSearch: (textSearch: string) => ({ textSearch }),
		setSort: (sort: SORTABLE_PROPERTIES) => ({ sort }),
		setSortOpen: (sortOpen: boolean) => ({ sortOpen }),
	},
}

export type ClientMetricsState = typeof setup.state & ViewState
export type ClientMetricsGetters = typeof setup.getters
export type ClientMetricsActions = typeof setup.actions
export type ClientMetricsMutators = typeof setup.mutators
export interface ClientMetricsStore extends ViewStore, ClientMetricsGetters, ClientMetricsActions, ClientMetricsMutators {
	state: ClientMetricsState
}
const clientMetricsSetup = mixStores(viewSetup, setup)
export default clientMetricsSetup
