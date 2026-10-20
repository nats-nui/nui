import cnnApi from "@/api/connection"
import { socketPool } from "@/plugins/SocketService/pool"
import { Connection } from "@/types/Connection"
import { docsSo, utils } from "@priolo/jack"
import { createStore, mixStores, StoreOf } from "@priolo/jon"
import { DOC_TYPE } from "../docs/types"
import loadBaseSetup, { LoadBaseState, LoadBaseStore } from "../stacks/loadBase"



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
			const s = store as ConnectionStore
			const cnnStore = utils.findAll(docsSo.getAllCards(), { type: DOC_TYPE.CONNECTIONS })?.[0]
			//socketPool.closeAll()
			const cnn = await cnnApi.index({ store: cnnStore })
			s.setAll(cnn)
			await loadBaseSetup.actions.fetch(_, store)
			socketPool.connectAll()
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

		/** salva la CONNECTION passata come parametro */
		async save(cnn: Connection, store?: ConnectionStore) {
			const cnnSaved = await cnnApi.save(cnn)
			store.update(cnnSaved)

			const key = `global::${cnnSaved.id}`
			socketPool.destroyForce(key)
			socketPool.getOrCreate(key, cnnSaved.id)

			return cnnSaved
		},
		
		/** inserisce o aggiorna la CONNECTION passata come paramnetro */
		update(cnn: Partial<Connection>, store?: ConnectionStore) {
			if (!cnn?.id) return
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

const cnnSetup = mixStores(loadBaseSetup, setup)
export interface ConnectionStore extends StoreOf<typeof cnnSetup> {}
export type ConnectionState = ConnectionStore["state"]
const cnnSo = createStore(cnnSetup) as ConnectionStore
export default cnnSo
