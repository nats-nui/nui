import bucketApi from "@/api/buckets"
import srcIcon from "@/assets/StreamsIcon.svg"
import { COLOR_VAR } from "@/stores/layout"
import viewSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { BucketConfig, BucketState } from "@/types/Bucket"
import { StoreCore, mixStores } from "@priolo/jon"
import { buildNewBucketConfig } from "./utils/factory"
import { buildKVEntries, buildKVEntry } from "@/stores/docs/utils/factory"
import docSo from "@/stores/docs"


/** STREAM DETAIL */
const setup = {

	state: {
		/** la CONNECTION che contiene sto STREAM */
		connectionId: <string>null,

		/** BUCKET caricata nella CARD */
		bucket: <BucketState>null,
		bucketConfig: <BucketConfig>null,
		/** BUCKET è editabile? */
		readOnly: true,

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
				readOnly: state.readOnly,
			}
		},
		//#endregion

	},

	actions: {

		//#region VIEWBASE
		setSerialization: (data: any, store?: ViewStore) => {
			viewSetup.actions.setSerialization(data, store)
			const state = store.state as BucketStatus
			state.connectionId = data.connectionId
			state.bucket = data.bucket
			state.readOnly = data.readOnly
		},
		//#endregion

		/** crea un nuovo BUCKET tramite BUCKET-CONFIG */
		async save(_: void, store?: BucketStore) {
			const bucketSaved = await bucketApi.create(store.state.connectionId, store.state.bucketConfig)
			store.setBucket(bucketSaved)
		},

		/** carico tutti i dati dello STREAM se ce ne fosse bisogno */
		fetch: async (_: void, store?: BucketStore) => {
			// verifico che ci siano i dati del dettaglio dello STREAM
			// TO DO
		},

		/** apertura della CARD KVENTRY */
		openKVEntries(_: void, store?: BucketStore) {
			const view = buildKVEntries(store.state.connectionId, store.state.bucket)
			docSo.addLink({ view, parent: store, anim: true })
		},

		restore: async (_: void, store?: BucketStore) => {
			store.setBucketConfig(buildNewBucketConfig())
		}	
	},

	mutators: {
		setBucket: (bucket: BucketState) => ({ bucket }),
		setBucketConfig: (bucketConfig: BucketConfig) => ({ bucketConfig }),
		setReadOnly: (readOnly: boolean) => ({ readOnly }),
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
