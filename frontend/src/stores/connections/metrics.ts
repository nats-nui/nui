import { socketPool } from "@/plugins/SocketService/pool"
import { MSG_TYPE } from "@/plugins/SocketService/types"
import { DOC_TYPE } from "@/types"
import { Metrics } from "@/types/Metrics"
import { docsSo, utils } from "@priolo/jack"
import { createStore, StoreSetup } from "@priolo/jon"
import { LoadBaseState, LoadBaseStore } from "../stacks/loadBase"



const setup = {

	state: {
		all: <{ [cnnId: string]: MetricsListener }>{},
		idTimeout: <any>null,
	},

	getters: {
	},

	actions: {

		async enable(cnnId: string, store?: MetricsStore) {
			const ss = await socketPool.create(`global::${cnnId}`, cnnId)
			if (!ss) return
			let listener = store.state.all[cnnId]
			if (!!listener) return

			const onMessage = (message: any) => {
				store.state.all[cnnId].last = message.payload.nats
				store.update()
			}
			store.state.all[cnnId] = {
				last: null,
				onMessage,
			}
			ss.emitter.on(MSG_TYPE.METRICS_RESP, onMessage)
			ss.send(JSON.stringify({
				type: MSG_TYPE.METRICS_REQ,
				payload: { enabled: true }
			}))
		},

		async disable(cnnId: string, store?: MetricsStore) {
			const result = utils.forEachViews(
				docsSo.getAllCards(), 
				(view) => (view.state.type == DOC_TYPE.CNN_METRICS || view.state.type == DOC_TYPE.CLIENT_METRICS) && view.state["connectionId"] == cnnId,
			)
			if (result) return
			//if (utils.findAll(docsSo.getAllCards(), { connectionId: cnnId, type: DOC_TYPE.CNN_METRICS }).length > 0) return
			store.remove(cnnId)
		},

		async remove(cnnId: string, store?: MetricsStore) {
			const ss = socketPool.getById(`global::${cnnId}`)
			if (!ss) return 
			const listener = store.state.all[cnnId]
			if (!listener) return
			delete store.state.all[cnnId]
			ss.emitter.off(MSG_TYPE.METRICS_RESP, listener.onMessage)
			ss.send(JSON.stringify({
				type: MSG_TYPE.METRICS_REQ,
				payload: { enabled: false }
			}))
		},

		update (_: void, store?: MetricsStore) {
			if ( !!store.state.idTimeout ) return
			store.state.idTimeout = setTimeout(() => {
				store.state.idTimeout = null
				store._update()
			}, 1000)
		}

	},

	mutators: {
		setAll: (all: { [cnnId: string]: Metrics }) => ({ all }),
	},
}

export type MetricsState = typeof setup.state & LoadBaseState
export type MetricsGetters = typeof setup.getters
export type MetricsActions = typeof setup.actions
export type MetricsMutators = typeof setup.mutators

/**
 * Gestisce le connessioni disponibili dal BE
 */
export interface MetricsStore extends LoadBaseStore, MetricsGetters, MetricsActions, MetricsMutators {
	state: MetricsState
}

const metricsSo = createStore(setup as StoreSetup<any>) as MetricsStore

export default metricsSo


export interface MetricsListener {
	last: Metrics
	onMessage: (message: any) => void
}
