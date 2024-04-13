import cnnApi from "@/api/connection"
import { Connection } from "@/types/Connection"
import { StoreCore, createStore, mixStores } from "@priolo/jon"
import loadBaseSetup, { LoadBaseState, LoadBaseStore } from "../stacks/loadBase"
import { socketPool } from "@/plugins/SocketService/pool"



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
	},

	actions: {

		//#region OVERWRITE
		async fetch(_: void, store?: LoadBaseStore) {
			const s = <ConnectionStore>store
			const cnn = await cnnApi.index()
			s.setAll(cnn)
			await loadBaseSetup.actions.fetch(_, store)
		},
		//#endregion

		async fetchIfVoid(_: void, store?: ConnectionStore) {
			if (!!store.state.all) return
			await store.fetch()
		},

		async delete(id: string, store?: ConnectionStore) {
			await cnnApi.remove(id)
			store.setAll(store.state.all.filter(c => c.id != id))
		},
		async save(cnn: Connection, store?: ConnectionStore) {
			const cnnSaved = await cnnApi.save(cnn)
			store.update(cnnSaved)

			const key = `global::${cnnSaved.id}`
			socketPool.destroyForce(key)
			socketPool.create(key, cnnSaved.id)
			
			return cnnSaved
		},
		/** inserisce o aggiorna la CONNECTION passata come paramnetro */
		update(cnn: Partial<Connection>, store?: ConnectionStore) {
			if ( !cnn?.id ) return
			const cnns = [...store.state.all]
			const index = store.getIndexById(cnn.id)
			if (index == -1) {
				cnns.push(cnn as Connection)
			} else {
				cnns[index] = { ...cnns[index], ...cnn }
			}
			store.setAll(cnns)
		},
	},

	mutators: {
		setAll: (all: Connection[]) => ({ all }),
	},
}

export type ConnectionState = typeof setup.state & LoadBaseState
export type ConnectionGetters = typeof setup.getters
export type ConnectionActions = typeof setup.actions
export type ConnectionMutators = typeof setup.mutators

/**
 * Gestisce le connessioni disponibili dal BE
 */
export interface ConnectionStore extends StoreCore<ConnectionState>, LoadBaseStore, ConnectionGetters, ConnectionActions, ConnectionMutators {
	state: ConnectionState
}

const cnnSetup = mixStores(loadBaseSetup, setup)
const cnnSo = createStore(cnnSetup) as ConnectionStore

export default cnnSo
