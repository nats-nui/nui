import cnnApi from "@/api/connection"
import { Connection } from "@/types/Connection"
import { StoreCore, createStore } from "@priolo/jon"



const setup = {

	state: {
		all: <Connection[]>null,
	},

	getters: {
		getById(id: string, store?: ConnectionStore) {
			if (!id) return null
			return store.state.all?.find(cnn => cnn.id == id)
		},
		getIndexById(id: string, store?: ConnectionStore) {
			if (!id) return null
			return store.state.all?.findIndex(cnn => cnn.id == id)
		},
		getTitle: (_: void, store?: ConnectionStore) => "CONNECTIONS",
	},

	actions: {
		async fetch(_: void, store?: ConnectionStore) {
			const cnn = await cnnApi.index()
			store.setAll(cnn)
		},
		async delete(id: string, store?: ConnectionStore) {
			await cnnApi.remove(id)
			store.setAll(store.state.all.filter(c => c.id != id))
		},
		async save(cnn: Connection, store?: ConnectionStore) {
			const cnnSaved = await cnnApi.save(cnn)
			const cnns = [...store.state.all]
			const index = !cnn.id ? -1 : store.getIndexById(cnn.id)
			if (index == -1) {
				cnns.push(cnnSaved)
			} else {
				cnns[index] = cnnSaved
			}
			store.setAll(cnns)
			return cnnSaved
		},
	},

	mutators: {
		setAll: (all: Connection[]) => ({ all }),
	},
}

export type ConnectionState = typeof setup.state
export type ConnectionGetters = typeof setup.getters
export type ConnectionActions = typeof setup.actions
export type ConnectionMutators = typeof setup.mutators
/**
 * Gestisce le connessioni disponibili dal BE
 */
export interface ConnectionStore extends StoreCore<ConnectionState>, ConnectionGetters, ConnectionActions, ConnectionMutators {
	state: ConnectionState
}
//export default setup
const store = createStore(setup) as ConnectionStore
export default store
