import bucketApi from "@/api/buckets"
import srcIcon from "@/assets/StreamsIcon.svg"
import { COLOR_VAR } from "@/stores/layout"
import viewSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { BucketConfig, BucketState } from "@/types/Bucket"
import { StoreCore, mixStores } from "@priolo/jon"
import { buildNewBucketConfig } from "./utils/factory"
import { buildKVEntries, buildKVEntry } from "../kventry/utils/factory"
import docSo from "@/stores/docs"
import { BucketsState, BucketsStore } from "."
import { DOC_TYPE, EDIT_STATE } from "@/types"


/** STREAM DETAIL */
const setup = {

	state: {
		connectionId: <string>null,
		bucket: <BucketState>null,
		bucketConfig: <BucketConfig>null,

		editState: EDIT_STATE.READ,

		//#region VIEWBASE
		colorVar: COLOR_VAR.YELLOW,
		width: 230,
		//#endregion

	},

	getters: {

		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) => (<BucketStore>store).state.bucket?.bucket ?? "--",
		getSubTitle: (_: void, store?: ViewStore) => "BUCKET DETAIL",
		getIcon: (_: void, store?: ViewStore) => srcIcon,
		getSerialization: (_: void, store?: ViewStore) => {
			const state = store.state as BucketStatus
			return {
				...viewSetup.getters.getSerialization(null, store),
				connectionId: state.connectionId,
				bucket: state.bucket,
				editState: state.editState,
			}
		},
		//#endregion

		getParentList: (_: void, store?: BucketStore): BucketsStore => docSo.find({
			type: DOC_TYPE.BUCKETS,
			connectionId: store.state.connectionId,
		} as Partial<BucketsState>) as BucketsStore,
	},

	actions: {

		//#region VIEWBASE
		setSerialization: (data: any, store?: ViewStore) => {
			viewSetup.actions.setSerialization(data, store)
			const state = store.state as BucketStatus
			state.connectionId = data.connectionId
			state.bucket = data.bucket
			state.editState = data.editState
		},
		//#endregion

		/** load all ENTITY */
		async fetch(_: void, store?: BucketStore) {
			const bucket = await bucketApi.get(store.state.connectionId, store.state.bucket.bucket)
			store.setBucket(bucket)
		},
		/** crea un nuovo BUCKET tramite BUCKET-CONFIG */
		async save(_: void, store?: BucketStore) {
			const bucketSaved = await bucketApi.create(store.state.connectionId, store.state.bucketConfig)
			store.setBucket(bucketSaved)
			store.getParentList()?.update(bucketSaved)
			store.getParentList()?.setSelect(bucketSaved.bucket)
			store.setEditState(EDIT_STATE.READ)
		},



		/** apertura della CARD KVENTRY */
		openKVEntries(_: void, store?: BucketStore) {
			const view = buildKVEntries(store.state.connectionId, store.state.bucket)
			docSo.addLink({ view, parent: store, anim: true })
		},
	},

	mutators: {
		setBucket: (bucket: BucketState) => ({ bucket }),
		setBucketConfig: (bucketConfig: BucketConfig) => ({ bucketConfig }),
		setEditState: (editState: EDIT_STATE) => ({ editState }),
	},
}

export type BucketStatus = typeof setup.state & ViewState
export type BucketGetters = typeof setup.getters
export type BucketActions = typeof setup.actions
export type BucketMutators = typeof setup.mutators
export interface BucketStore extends ViewStore, StoreCore<BucketStatus>, BucketGetters, BucketActions, BucketMutators {
	state: BucketStatus
}
const bucketSetup = mixStores(viewSetup, setup)
export default bucketSetup
