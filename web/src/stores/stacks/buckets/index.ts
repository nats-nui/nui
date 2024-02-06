import bucketApi from "@/api/buckets"
import srcIcon from "@/assets/StreamsIcon.svg"
import cnnSo from "@/stores/connections"
import { COLOR_VAR } from "@/stores/layout"
import { ViewState, ViewStore, default as docSetup, default as viewSetup } from "@/stores/stacks/viewBase"
import { BucketState } from "@/types/Bucket"
import { StoreCore, mixStores } from "@priolo/jon"
import docsSo from "@/stores/docs"
import { buildBucket, buildKVEntry } from "@/stores/docs/utils/factory"
import { BucketStore } from "./detail"
import { buildNewBucketConfig } from "./utils/factory"



/** BUCKETS COLLECTION */
const setup = {

	state: {
		connectionId: <string>null,
		/** nome del BUCKET selezionato */
		select: <string>null,
		all: <BucketState[]>[],

		//#region VIEWBASE
		width: 366,
		colorVar: COLOR_VAR.YELLOW,
		//#endregion
	},

	getters: {

		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) => cnnSo.getById((<BucketsStore>store).state.connectionId)?.name,
		getSubTitle: (_: void, store?: ViewStore) => "BUCKETS",
		getIcon: (_: void, store?: ViewStore) => srcIcon,
		getSerialization: (_: void, store?: ViewStore) => {
			const state = store.state as BucketsState
			return {
				...viewSetup.getters.getSerialization(null, store),
				connectionId: state.connectionId,
				select: state.select,
			}
		},
		//#endregion

		getByName(name: string, store?: BucketsStore) {
			if (!name) return null
			return store.state.all?.find(s => s.bucket == name)
		},
		getIndexByName(name: string, store?: BucketsStore) {
			if (!name) return null
			return store.state.all?.findIndex(s => s.bucket == name)
		},
	},

	actions: {

		//#region VIEWBASE
		setSerialization: (data: any, store?: ViewStore) => {
			viewSetup.actions.setSerialization(data, store)
			const state = store.state as BucketsState
			state.connectionId = data.connectionId
			state.select = data.select
		},
		//#endregion

		/** load tutti i BUCKETS di una CONNECTION */
		async fetch(_: void, store?: BucketsStore) {
			const buckets = await bucketApi.index(store.state.connectionId)
			store.setAll(buckets)
		},

		/** visualizzo dettaglio di un BUCKET */
		select(name: string, store?: BucketsStore) {
			const nameOld = store.state.select
			let nameNew = null
			let view: BucketStore = null
			if (name && nameOld != name) {
				nameNew = name
				view = buildBucket(store.state.connectionId, store.getByName(nameNew))
			}
			store.setSelect(nameNew)
			docsSo.addLink({ view, parent: store, anim: !nameOld || !nameNew, })
		},

		/** visualizzo nuovo BUCKET */
		create(_: void, store?: BucketsStore) {
			const view = buildBucket(store.state.connectionId, null, buildNewBucketConfig())
			docsSo.addLink({ 
				view, 
				parent: store, 
				anim: true 
			})
		}

	},

	mutators: {
		setAll: (all: BucketState[]) => ({ all }),
		setSelect: (select: string) => ({ select }),
	},
}

export type BucketsState = typeof setup.state & ViewState
export type BucketsGetters = typeof setup.getters
export type BucketsActions = typeof setup.actions
export type BucketsMutators = typeof setup.mutators
export interface BucketsStore extends ViewStore, StoreCore<BucketsState>, BucketsGetters, BucketsActions, BucketsMutators {
	state: BucketsState
}
const bucketsSetup = mixStores(docSetup, setup)
export default bucketsSetup
