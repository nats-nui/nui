import bucketApi from "@/api/buckets"
import docSo from "@/stores/docs"
import { focusSo, utils } from "@priolo/jack"
import { MESSAGE_TYPE } from "@/stores/log/utils"
import viewSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { DOC_TYPE, EDIT_STATE } from "@/types"
import { BucketConfig, BucketState } from "@/types/Bucket"
import { StoreCore, mixStores } from "@priolo/jon"
import { BucketsState, BucketsStore } from "."
import { buildKVEntries } from "../kventry/utils/factory"
import loadBaseSetup, { LoadBaseState, LoadBaseStore } from "../loadBase"
import { VIEW_SIZE } from "../utils"
import { buildStore } from "../../docs/utils/factory"
import { JsonConfigState, JsonConfigStore } from "../jsonconfig"



/** BUCKET DETAIL */
const setup = {

	state: {
		connectionId: <string>null,
		bucket: <BucketState>null,
		bucketConfig: <BucketConfig>null,

		editState: EDIT_STATE.READ,

		//#region VIEWBASE
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

		getParentList: (_: void, store?: BucketStore): BucketsStore => utils.findInRoot(store.state.group.state.all, {
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

		async fetchIfVoid(_: void, store?: BucketStore) {
			// eventualmente aggiorno i dati
			if (store.state.editState != EDIT_STATE.NEW /*&& !store.state.bucket?.config*/) {
				await store.fetch()
			}
		},

		/** crea un nuovo BUCKET tramite BUCKET-CONFIG */
		async save(_: void, store?: BucketStore) {
			let bucketSaved: BucketState = null
			if (store.state.editState == EDIT_STATE.NEW) {
				bucketSaved = await bucketApi.create(store.state.connectionId, store.state.bucket.config, { store })
			} else {
				bucketSaved = await bucketApi.update(store.state.connectionId, store.state.bucket.config, { store })
			}
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
		/** reset ENTITY */
		restore: (_: void, store?: BucketStore) => {
			store.fetch()
			store.setEditState(EDIT_STATE.READ)
		},


		/** apertura della CARD JSON CONFIG */
		openJsonConfig(_: void, store?: BucketStore) {
			// se è già aperta la chiudo
			const configOpen = store.state.linked?.state.type == DOC_TYPE.JSON_CONFIG
			if (configOpen) {
				store.state.group.addLink({ view: null, parent: store, anim: true })
				return
			}
			const configStore = buildStore({
				type: DOC_TYPE.JSON_CONFIG,
				value: JSON.stringify(store.state.bucket.config),
				title: `BUCKET: ${store.state.bucket.bucket}`,
				onClose: (value: string) => {
					if (!value) return
					const config = JSON.parse(value) as BucketConfig
					store?.setBucketConfig(config)
				},
			} as JsonConfigState) as JsonConfigStore;
			store.state.group.addLink({ view: configStore, parent: store, anim: true })
		},

		/** apertura della CARD KVENTRY */
		openKVEntries(_: void, store?: BucketStore) {
			const detached = focusSo.state.shiftKey
			const isOpen = store.getKVEntriesOpen()
			const view = !isOpen ? buildKVEntries(store.state.connectionId, store.state.bucket) : null
			store.state.group[detached ? "add" : "addLink"]({ view, parent: store, anim: true })
		},

	},

	mutators: {
		setBucket: (bucket: BucketState) => ({ bucket }),
		setBucketConfig: (config: Partial<BucketConfig>, store?: BucketStore) => {
			return { bucket: { ...store.state.bucket, config } }
		},
		setEditState: (editState: EDIT_STATE) => ({ editState }),
	},
}

export type BucketStatus = typeof setup.state & ViewState & LoadBaseState
export type BucketGetters = typeof setup.getters
export type BucketActions = typeof setup.actions
export type BucketMutators = typeof setup.mutators
export interface BucketStore extends ViewStore, LoadBaseStore, BucketGetters, BucketActions, BucketMutators {
	state: BucketStatus
}
const bucketSetup = mixStores(viewSetup, loadBaseSetup, setup)
export default bucketSetup
