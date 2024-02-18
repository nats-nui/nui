import kventryApi from "@/api/kventries"
import srcIcon from "@/assets/StreamsIcon.svg"
import cnnSo from "@/stores/connections"
import docSo from "@/stores/docs"
import { buildKVEntry, buildKVEntryNew } from "./utils/factory"
import { COLOR_VAR } from "@/stores/layout"
import { ViewState, ViewStore, default as docSetup, default as viewSetup } from "@/stores/stacks/viewBase"
import { BucketState } from "@/types/Bucket"
import { KVEntry } from "@/types/KVEntry"
import { StoreCore, mixStores } from "@priolo/jon"



/** BUCKETS COLLECTION */
const setup = {

	state: {
		/** connessione di riferimento */
		connectionId: <string>null,
		bucket: <BucketState>null,
		/** nome del BUCKET selezionato */
		select: <string>null,
		all: <KVEntry[]>null,

		//#region VIEWBASE
		width: 310,
		colorVar: COLOR_VAR.YELLOW,
		//#endregion
	},

	getters: {

		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) => cnnSo.getById((<KVEntriesStore>store).state.connectionId)?.name,
		getSubTitle: (_: void, store?: ViewStore) => "KVENTRIES",
		getIcon: (_: void, store?: ViewStore) => srcIcon,
		getSerialization: (_: void, store?: ViewStore) => {
			const state = store.state as KVEntriesState
			return {
				...viewSetup.getters.getSerialization(null, store),
				connectionId: state.connectionId,
				bucket: state.bucket,
				select: state.select,
			}
		},
		//#endregion

		getByName(key: string, store?: KVEntriesStore) {
			if (!key) return null
			return store.state.all?.find(s => s.key == key)
		},
		getIndexByName(name: string, store?: KVEntriesStore) {
			if (!name) return -1
			return store.state.all?.findIndex(s => s.key == name)
		},
	},

	actions: {

		//#region VIEWBASE
		setSerialization: (data: any, store?: ViewStore) => {
			viewSetup.actions.setSerialization(data, store)
			const state = store.state as KVEntriesState
			state.connectionId = data.connectionId
			state.bucket = data.bucket
			state.select = data.select
		},
		//#endregion



		async fetchIfVoid(_: void, store?: KVEntriesStore) {
			if (!!store.state.all) return
			await store.fetch()
		},
		async fetch(_: void, store?: KVEntriesStore) {
			const kventries = await kventryApi.index(store.state.connectionId, store.state.bucket.bucket, {store})
			store.setAll(kventries)
		},
		async create(_: void, store?: KVEntriesStore) {
			const view = buildKVEntryNew(store.state.connectionId, store.state.bucket)
			docSo.addLink({ view, parent: store, anim: true })
			store.setSelect(null)
		},
		async delete(_: void, store?: KVEntriesStore) {
			const key = store.state.select
			await kventryApi.remove(store.state.connectionId, store.state.bucket.bucket, key, {store})
			store.setAll(store.state.all.filter(entry => entry.key != key))
			store.setSelect(null)
		},



		/** apro la CARD del dettaglio */
		select(key: string, store?: KVEntriesStore) {
			const oldkey = store.state.select
			const newKey = (key && oldkey !== key) ? key : null
			const view = newKey ? buildKVEntry(store.state.connectionId, store.state.bucket, store.getByName(key)) : null
			store.setSelect(newKey)
			docSo.addLink({ view, parent: store, anim: !oldkey || !newKey })
		},
	},

	mutators: {
		setAll: (all: KVEntry[]) => ({ all }),
		setSelect: (select: string) => ({ select }),
	},
}

export type KVEntriesState = typeof setup.state & ViewState
export type KVEntriesGetters = typeof setup.getters
export type KVEntriesActions = typeof setup.actions
export type KVEntriesMutators = typeof setup.mutators
export interface KVEntriesStore extends ViewStore, StoreCore<KVEntriesState>, KVEntriesGetters, KVEntriesActions, KVEntriesMutators {
	state: KVEntriesState
}
const kventriesSetup = mixStores(docSetup, setup)
export default kventriesSetup
