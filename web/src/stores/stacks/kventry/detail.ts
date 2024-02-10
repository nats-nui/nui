import kventryApi from "@/api/kventries"
import srcIcon from "@/assets/StreamsIcon.svg"
import docSo from "@/stores/docs"
import { COLOR_VAR } from "@/stores/layout"
import viewSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { DOC_TYPE, EDIT_STATE } from "@/types"
import { BucketState } from "@/types/Bucket"
import { KVEntry } from "@/types/KVEntry"
import { StoreCore, mixStores } from "@priolo/jon"
import { KVEntriesState, KVEntriesStore } from "."



/** KVENTRY DETAIL */
const setup = {

	state: {
		connectionId: <string>null,
		bucket: <BucketState>null,
		kventry: <KVEntry>null,

		editState: EDIT_STATE.READ,

		//#region VIEWBASE
		colorVar: COLOR_VAR.YELLOW,
		width: 230,
		//#endregion
	},

	getters: {

		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) => (<KVEntryStore>store).state.bucket?.bucket ?? "--",
		getSubTitle: (_: void, store?: ViewStore) => "KVENTRY DETAIL",
		getIcon: (_: void, store?: ViewStore) => srcIcon,
		getSerialization: (_: void, store?: ViewStore) => {
			const state = store.state as KVEntryState
			return {
				...viewSetup.getters.getSerialization(null, store),
				connectionId: state.connectionId,
				bucket: state.bucket,
				kventry: state.kventry,
				editState: state.editState,
			}
		},
		//#endregion

		getParentList: (_: void, store?: KVEntryStore): KVEntriesStore => docSo.find({
			type: DOC_TYPE.KVENTRIES,
			connectionId: store.state.connectionId,
			bucket: { bucket: store.state.bucket.bucket }
		} as Partial<KVEntriesState>) as KVEntriesStore,

	},

	actions: {

		//#region VIEWBASE
		setSerialization: (data: any, store?: ViewStore) => {
			viewSetup.actions.setSerialization(data, store)
			const state = store.state as KVEntryState
			state.connectionId = data.connectionId
			state.bucket = data.bucket
			state.kventry = data.kventry
			state.editState = data.editState
		},
		//#endregion



		async fetchIfVoid(_: void, store?: KVEntryStore) {
			if (!!store.state.kventry) return
			await store.fetch()
		},
		fetch: async (_: void, store?: KVEntryStore) => {
			const kventry = await kventryApi.get(store.state.connectionId, store.state.bucket.bucket, store.state.kventry.key)
			store.setKVEntry(kventry)
		},
		/** crea un nuovo KVENTRY */
		async save(_: void, store?: KVEntryStore) {
			const kventry = await kventryApi.put(store.state.connectionId, store.state.bucket.bucket, store.state.kventry.key, store.state.kventry.payload)
			store.setKVEntry(kventry)
			store.getParentList()?.fetch()
			store.getParentList()?.setSelect(kventry.key)
			store.setEditState(EDIT_STATE.READ)
		},
		/** reset EBTITY */
		restore: (_: void, store?: KVEntryStore) => {
			store.fetch()
			store.setEditState(EDIT_STATE.READ)
		},
	},

	mutators: {
		setKVEntry: (kventry: KVEntry) => ({ kventry }),
		setEditState: (editState: EDIT_STATE) => ({ editState }),
	},
}

export type KVEntryState = typeof setup.state & ViewState
export type KVEntryGetters = typeof setup.getters
export type KVEntryActions = typeof setup.actions
export type KVEntryMutators = typeof setup.mutators
export interface KVEntryStore extends ViewStore, StoreCore<KVEntryState>, KVEntryGetters, KVEntryActions, KVEntryMutators {
	state: KVEntryState
}
const kventrySetup = mixStores(viewSetup, setup)
export default kventrySetup
