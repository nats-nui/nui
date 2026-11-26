import cnnApi from "@/api/connection"
import { socketPool } from "@/plugins/SocketService/pool"
import { Connection } from "@/types/Connection"
import { docsSo, utils } from "@priolo/jack"
import { createStore, equalsIgnore, equalsSome, mixStores, StoreOf } from "@priolo/jon"
import { DOC_TYPE } from "../docs/types"
import { menuSo } from "../docs/links"
import loadBaseSetup, { LoadBaseState, LoadBaseStore } from "../stacks/loadBase"
import type { SubjectsStore } from "../stacks/connection/subjects"



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
			if (cnn && s.state.all) {
				const next = new Map(cnn.map(profile => [profile.id, profile]))
				for (const previous of s.state.all) invalidateChangedProfile(previous, next.get(previous.id))
			}
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
			invalidateChangedProfile(store.getById(id))
			store.setAll(store.state.all.filter(c => c.id != id))
		},

		/** salva la CONNECTION passata come parametro */
		async save(cnn: Connection, store?: ConnectionStore) {
			const cnnSaved = await cnnApi.save(cnn).catch(async error => {
				// The server can save the profile before its connection refresh fails.
				await store.fetch().catch(() => invalidateChangedProfile(store.getById(cnn.id), cnn))
				throw error
			})
			store.update(cnnSaved)

			const key = `global::${cnnSaved.id}`
			socketPool.destroyForce(key)
			socketPool.getOrCreate(key, cnnSaved.id)

			return cnnSaved
		},
		
		/** inserisce o aggiorna la CONNECTION passata come paramnetro */
		update(cnn: Partial<Connection>, store?: ConnectionStore) {
			if (!cnn?.id) return
			const cnns = [...(store.state.all ?? [])]
			const index = store.getIndexById(cnn.id) ?? -1
			if (index == -1) {
				cnns.push(cnn as Connection)
			} else {
				cnns[index] = { ...cnns[index], ...cnn }
				invalidateChangedProfile(store.state.all[index], cnns[index])
			}
			store.setAll(cnns)
		},
	},

	mutators: {
		setAll: (all: Connection[]) => ({ all }),
	},
}

function invalidateChangedProfile(before: Connection, after?: Connection) {
	if (!before || equalsSome(before, after, ["name", "hosts", "inboxPrefix", "auth", "tlsAuth"])) return
	if (after) {
		const auth = before.auth ?? [], nextAuth = after.auth ?? []
		if (before.name === after.name && before.inboxPrefix === after.inboxPrefix
			&& equalsIgnore(before.hosts ?? [], after.hosts ?? []) && equalsIgnore(before.tlsAuth ?? null, after.tlsAuth ?? null)
			&& auth.length === nextAuth.length && auth.every((entry, index) => equalsIgnore(entry, nextAuth[index]))) return
	}
	const roots = [...docsSo.getAllCards(), ...menuSo.state.all]
	const cards = utils.findAll(roots, { type: DOC_TYPE.SUBJECTS, connectionId: before.id })
	for (const card of new Set(cards)) (card as SubjectsStore).invalidateSubjects()
	// JetStream sequence numbers belong to the stream that assigned them.
	const streamCards = utils.findAll(roots, { type: DOC_TYPE.STREAM_MESSAGES, connectionId: before.id })
	for (const card of new Set(streamCards)) {
		if (card.state.group) {
			card.state.group.remove({ view: card }) // Also cancels an open delete confirmation.
		} else {
			card.state.parent?.setLinked(null)
		}
		if (menuSo.state.all.includes(card)) menuSo.remove(card)
		if (docsSo.state.zenCard === card && docsSo.state.zenOpen) docsSo.zenClose()
	}
}

const cnnSetup = mixStores(loadBaseSetup, setup)
export interface ConnectionStore extends StoreOf<typeof cnnSetup> {}
export type ConnectionState = ConnectionStore["state"]
const cnnSo = createStore(cnnSetup) as ConnectionStore
export default cnnSo
