import bucketApi from "@/api/buckets"
import srcIcon from "@/assets/StreamsIcon.svg"
import cnnSo from "@/stores/connections"
import { COLOR_VAR } from "@/stores/layout"
import { ViewState, ViewStore, default as docSetup, default as viewSetup } from "@/stores/stacks/viewBase"
import { BucketState } from "@/types/Bucket"
import { StoreCore, mixStores } from "@priolo/jon"
import docsSo from "@/stores/docs"
import { buildBucket, buildKVEntry } from "@/stores/docs/utils/factory"
import { KVEntryStore } from "./detail"
import { KVEntry } from "@/types/KVEntry"



/** BUCKETS COLLECTION */
const setup = {

	state: {
		connectionId: <string>null,
		bucket: <BucketState>null,
		/** nome del BUCKET selezionato */
		select: <string>null,
		all: <KVEntry[]>[],

		//#region VIEWBASE
		width: 366,
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
				select: state.select,
			}
		},
		//#endregion

		getByName(key: string, store?: KVEntriesStore) {
			if (!key) return null
			return store.state.all?.find(s => s.key == key)
		},
		getIndexByName(name: string, store?: KVEntriesStore) {
			if (!name) return null
			return store.state.all?.findIndex(s => s.key == name)
		},
	},

	actions: {

		//#region VIEWBASE
		setSerialization: (data: any, store?: ViewStore) => {
			viewSetup.actions.setSerialization(data, store)
			const state = store.state as KVEntriesState
			state.connectionId = data.connectionId
			state.select = data.select
		},
		//#endregion

		/** load tutti i BUCKETS di una CONNECTION */
		async fetch(_: void, store?: KVEntriesStore) {
			const buckets = await bucketApi.index(store.state.connectionId)
			store.setAll(buckets)
		},

		/** visualizzo dettaglio di un KVENTRY */
		select(key: string, store?: KVEntriesStore) {
			const keyOld = store.state.select
			let keyNew = null
			let view: KVEntryStore = null
			if (key && keyOld != key) {
				keyNew = key
				const kventry = store.getByName(keyNew)
				const bucket = store.state.bucket
				view = buildKVEntry(store.state.connectionId, bucket, kventry)
			}
			store.setSelect(keyNew)
			docsSo.addLink({ view, parent: store, anim: !keyOld || !keyNew, })
		},

		create(_: void, store?: KVEntriesStore) {
		},

	},

	mutators: {
		setAll: (all: BucketState[]) => ({ all }),
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
