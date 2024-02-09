import kventryApi from "@/api/kventries"
import srcIcon from "@/assets/StreamsIcon.svg"
import { COLOR_VAR } from "@/stores/layout"
import viewSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { BucketState } from "@/types/Bucket"
import { KVEntry } from "@/types/KVEntry"
import { StoreCore, mixStores } from "@priolo/jon"
import docSo from "@/stores/docs"
import { DOC_TYPE } from "@/types"
import { KVEntriesState, KVEntriesStore } from "."



/** KVENTRY DETAIL */
const setup = {

	state: {
		connectionId: <string>null,
		bucket: <BucketState>null,
		kventry: <KVEntry>null,

		readOnly: true,
		isNew: false,

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
				readOnly: state.readOnly,
				isNew: state.isNew,
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
			state.readOnly = data.readOnly
			state.isNew = data.isNew
		},
		//#endregion

		/** carico tutti i dati dello STREAM se ce ne fosse bisogno */
		fetch: async (_: void, store?: KVEntryStore) => {
			const kventry = await kventryApi.get(store.state.connectionId, store.state.bucket.bucket, store.state.kventry.key)
			store.setKVEntry(kventry)
		},
		/** crea un nuovo KVENTRY */
		async save(_: void, store?: KVEntryStore) {
			const kventry = await kventryApi.put(store.state.connectionId, store.state.bucket.bucket, store.state.kventry.key, store.state.kventry.payload)
			store.setKVEntry(kventry)
			store.setReadOnly(true)
			store.setIsNew(false)
			store.getParentList()?.fetch()
			store.getParentList()?.setSelect(kventry.key)
		},
		/** reset EBTITY */
		restore: (_: void, store?: KVEntryStore) => {
			store.fetch()
			store.setReadOnly(true)
		},
	},

	mutators: {
		setKVEntry: (kventry: KVEntry) => ({ kventry }),
		setReadOnly: (readOnly: boolean) => ({ readOnly }),
		setIsNew: (isNew: boolean) => ({ isNew }),
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
