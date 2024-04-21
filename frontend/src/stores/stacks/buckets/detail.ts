import bucketApi from "@/api/buckets"
import docSo from "@/stores/docs"
import { COLOR_VAR } from "@/stores/layout"
import viewSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { DOC_TYPE, EDIT_STATE } from "@/types"
import { BucketConfig, BucketState } from "@/types/Bucket"
import { StoreCore, mixStores } from "@priolo/jon"
import { BucketsState, BucketsStore } from "."
import { buildKVEntries } from "../kventry/utils/factory"
import loadBaseSetup, { LoadBaseState, LoadBaseStore } from "../loadBase"
import { VIEW_SIZE } from "../utils"
import { findInRoot } from "@/stores/docs/utils/manage"
import { MESSAGE_TYPE } from "@/stores/log/utils"



/** BUCKET DETAIL */
const setup = {

	state: {
		connectionId: <string>null,
		bucket: <BucketState>null,
		bucketConfig: <BucketConfig>null,

		editState: EDIT_STATE.READ,

		//#region VIEWBASE
		colorVar: COLOR_VAR.MINT,
		width: 230,
		size: VIEW_SIZE.COMPACT,
		//#endregion
	},

	getters: {

		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) => "BUCKET DETAIL",
		getSubTitle: (_: void, store?: ViewStore) => (<BucketStore>store).state.bucket?.bucket ?? "--",
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

		getParentList: (_: void, store?: BucketStore): BucketsStore => findInRoot(store.state.group.state.all, {
			type: DOC_TYPE.BUCKETS,
			connectionId: store.state.connectionId,
		} as Partial<BucketsState>) as BucketsStore,

		getKVEntriesOpen: (_: void, store?: BucketStore) => store.state.linked?.state.type == DOC_TYPE.KVENTRIES,
	},

	actions: {

		//#region OVERWRITE
		setSerialization: (data: any, store?: ViewStore) => {
			viewSetup.actions.setSerialization(data, store)
			const state = store.state as BucketStatus
			state.connectionId = data.connectionId
			state.bucket = data.bucket
			state.editState = data.editState
		},
		onLinked: (_: void, store?: ViewStore) => {
			const cnnStore = store as BucketStore
			const options = docSo.state.cardOptions[store.state.type]
			store.state.docAniDisabled = true
			if (options == DOC_TYPE.KVENTRIES) {
				cnnStore.openKVEntries()
			}
			store.state.docAniDisabled = false
		},
		async fetch(_: void, store?: LoadBaseStore) {
			const s = <BucketStore>store
			// se NEW è valorizzato solo "bucketConfig"
			if (!s.state.bucket) return
			const bucket = await bucketApi.get(s.state.connectionId, s.state.bucket.bucket, { store })
			s.setBucket(bucket)
		},
		//#endregion

		async fetchIfVoid(_: void, store?: BucketsStore) {
			if (!!store.state.all) return
			await store.fetch()
		},

		/** crea un nuovo BUCKET tramite BUCKET-CONFIG */
		async save(_: void, store?: BucketStore) {
			const bucketSaved = await bucketApi.create(store.state.connectionId, store.state.bucketConfig, { store })
			store.setBucket(bucketSaved)
			store.getParentList()?.update(bucketSaved)
			store.getParentList()?.setSelect(bucketSaved.bucket)
			store.setEditState(EDIT_STATE.READ)
			store.setSnackbar({
				open: true, type: MESSAGE_TYPE.SUCCESS, timeout: 5000,
				title: "SAVED",
				body: "you have it on the DUCKETS list",
			})
		},

		/** apertura della CARD KVENTRY */
		openKVEntries(_: void, store?: BucketStore) {
			const isOpen = store.getKVEntriesOpen()
			const view = !isOpen ? buildKVEntries(store.state.connectionId, store.state.bucket) : null
			store.state.group.addLink({ view, parent: store, anim: true })
		},
	},

	mutators: {
		setBucket: (bucket: BucketState) => ({ bucket }),
		setBucketConfig: (bucketConfig: BucketConfig) => ({ bucketConfig }),
		setEditState: (editState: EDIT_STATE) => ({ editState }),
	},
}

export type BucketStatus = typeof setup.state & ViewState & LoadBaseState
export type BucketGetters = typeof setup.getters
export type BucketActions = typeof setup.actions
export type BucketMutators = typeof setup.mutators
export interface BucketStore extends ViewStore, LoadBaseStore, StoreCore<BucketStatus>, BucketGetters, BucketActions, BucketMutators {
	state: BucketStatus
}
const bucketSetup = mixStores(viewSetup, loadBaseSetup, setup)
export default bucketSetup
