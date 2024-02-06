import kventryApi from "@/api/kventries"
import srcIcon from "@/assets/StreamsIcon.svg"
import { COLOR_VAR } from "@/stores/layout"
import viewSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { BucketConfig, BucketState } from "@/types/Bucket"
import { StoreCore, mixStores } from "@priolo/jon"
import { buildNewBucketConfig } from "./utils/factory"
import { KVEntry } from "@/types/KVEntry"



/** STREAM DETAIL */
const setup = {

	state: {
		/** la CONNECTION che contiene sto STREAM */
		connectionId: <string>null,
		bucket: <BucketState>null,
		kventry: <KVEntry>null,

		/** è editabile? */
		readOnly: true,

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
			const state = store.state as KVEntryStatus
			return {
				...viewSetup.getters.getSerialization(null, store),
				connectionId: state.connectionId,
				bucket: state.bucket,
				kventry: state.kventry,
				readOnly: state.readOnly,
			}
		},
		//#endregion

	},

	actions: {

		//#region VIEWBASE
		setSerialization: (data: any, store?: ViewStore) => {
			viewSetup.actions.setSerialization(data, store)
			const state = store.state as KVEntryStatus
			state.connectionId = data.connectionId
			state.bucket = data.bucket
			state.kventry = data.kventry
			state.readOnly = data.readOnly
		},
		//#endregion

		/** crea un nuovo KVENTRY */
		async save(_: void, store?: KVEntryStore) {
			const kventry = await kventryApi.put(store.state.connectionId, store.state.bucket.bucket, store.state.kventry.key, store.state.kventry.payload )
			store.setKVEntry(kventry)
		},

		/** carico tutti i dati dello STREAM se ce ne fosse bisogno */
		fetch: async (_: void, store?: KVEntryStore) => {
			// verifico che ci siano i dati del dettaglio dello STREAM
			// TO DO
		},

		restore: async (_: void, store?: KVEntryStore) => {
			store.setBucketConfig(buildNewBucketConfig())
		},
	},

	mutators: {
		setBucket: (bucket: BucketState) => ({ bucket }),
		setBucketConfig: (bucketConfig: BucketConfig) => ({ bucketConfig }),
		setKVEntry: (kventry: KVEntry) => ({ kventry }),
		setReadOnly: (readOnly: boolean) => ({ readOnly }),
	},
}

export type KVEntryStatus = typeof setup.state & ViewState
export type KVEntryGetters = typeof setup.getters
export type KVEntryActions = typeof setup.actions
export type KVEntryMutators = typeof setup.mutators
export interface KVEntryStore extends ViewStore, StoreCore<KVEntryStatus>, KVEntryGetters, KVEntryActions, KVEntryMutators {
	state: KVEntryStatus
}
const kventrySetup = mixStores(viewSetup, setup)
export default kventrySetup
