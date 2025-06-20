import metricsSo from "@/stores/connections/metrics"
import viewSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { DOC_TYPE } from "@/types"
import { focusSo } from "@priolo/jack"
import { mixStores } from "@priolo/jon"
import { buildClientMetrics } from "../utils/factory"
import cnnSo from "@/stores/connections"



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
		getSubTitle: (_: void, store?: ViewStore) =>  cnnSo.getById((<CnnMetricsStore>store).state.connectionId)?.name ?? "--",
		getSerialization: (_: void, store?: ViewStore) => {
			const state = store.state as CnnMetricsState
			return {
				...viewSetup.getters.getSerialization(null, store),
				connectionId: state.connectionId,
			}
		},
		//#endregion

		getClientOpen: (_: void, store?: CnnMetricsStore) => store.state.linked?.state.type == DOC_TYPE.CLIENT_METRICS,
	},

	actions: {

		//#region VIEWBASE
		setSerialization: (data: any, store?: ViewStore) => {
			viewSetup.actions.setSerialization(data, store)
			const state = store.state as CnnMetricsState
			state.connectionId = data.connectionId
		},
		//#endregion

		async onCreated(_: void, store?: CnnMetricsStore) {
			metricsSo.enable(store.state.connectionId)
		},

		onRemoval(_: void, store?: ViewStore) {
			metricsSo.disable((<CnnMetricsStore>store).state.connectionId)
		},

		/** apertura della CARD METRICS */
		openClients(_: void, store?: CnnMetricsStore) {
			const detached = focusSo.state.shiftKey
			const isOpen = store.getClientOpen()
			const view = !isOpen || detached ? buildClientMetrics(store.state.connectionId) : null
			store.state.group[detached ? "add" : "addLink"]({ view, parent: store, anim: true })
		},

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
