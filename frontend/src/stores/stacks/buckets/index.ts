import bucketApi from "@/api/buckets"
import srcIcon from "@/assets/StreamsIcon.svg"
import cnnSo from "@/stores/connections"
import docsSo from "@/stores/docs"
import { COLOR_VAR } from "@/stores/layout"
import { ViewState, ViewStore, default as docSetup, default as viewSetup } from "@/stores/stacks/viewBase"
import { BucketState } from "@/types/Bucket"
import { StoreCore, mixStores } from "@priolo/jon"
import { buildBucket, buildBucketNew } from "./utils/factory"



/** BUCKETS COLLECTION */
const setup = {

	state: {
		/** connessione di riferimento */
		connectionId: <string>null,
		/** elemento selezionato */
		select: <string>null,
		/** all elements */
		all: <BucketState[]>[],

		//#region VIEWBASE
		width: 310,
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
			if (!name) return -1
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



		async fetchIfVoid(_: void, store?: BucketsStore) {
			if (!!store.state.all) return
			await store.fetch()
		},
		async fetch(_: void, store?: BucketsStore) {
			const buckets = await bucketApi.index(store.state.connectionId, { store })
			store.setAll(buckets)

		},
		/** apro la CARD per creare un nuovo elemento */
		create(_: void, store?: BucketsStore) {
			const view = buildBucketNew(store.state.connectionId)
			docsSo.addLink({ view, parent: store, anim: true })
			store.setSelect(null)
		},
		async delete(_: void, store?: BucketsStore) {
			const name = store.state.select
			await bucketApi.remove(store.state.connectionId, name, { store })
			store.setAll(store.state.all.filter(b => b.bucket != name))
			store.setSelect(null)
		},



		update(bucket: BucketState, store?: BucketsStore) {
			const all = [...store.state.all]
			const index = store.getIndexByName(bucket.bucket)
			index == -1 ? all.push(bucket) : (all[index] = { ...all[index], ...bucket })
			store.setAll(all)
		},
		/** apro la CARD del dettaglio */
		select(name: string, store?: BucketsStore) {
			const nameOld = store.state.select
			const nameNew = (name && nameOld !== name) ? name : null
			const view = nameNew ? buildBucket(store.state.connectionId, store.getByName(nameNew)) : null
			store.setSelect(nameNew)
			docsSo.addLink({ view, parent: store, anim: !nameOld || !nameNew })
		},
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
