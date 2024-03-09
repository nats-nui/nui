import kventryApi from "@/api/kventries"
import docSo from "@/stores/docs"
import { COLOR_VAR } from "@/stores/layout"
import viewSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { DOC_TYPE, EDIT_STATE } from "@/types"
import { BucketState } from "@/types/Bucket"
import { KVEntry } from "@/types/KVEntry"
import { StoreCore, mixStores } from "@priolo/jon"
import { KVEntriesState, KVEntriesStore } from "."
import editorSetup, { EditorState, EditorStore } from "../editorBase"



/** KVENTRY DETAIL */
const setup = {

	state: {
		connectionId: <string>null,
		bucket: <BucketState>null,
		kventry: <KVEntry>null,

		editState: EDIT_STATE.READ,

		historyOpen: false,
		revisionSelected: <number>null,

		//#region VIEWBASE
		colorVar: COLOR_VAR.YELLOW,
		width: 420,
		//#endregion
	},

	getters: {

		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) => "KVENTRY DETAIL",
		getSubTitle: (_: void, store?: ViewStore) => (<KVEntryStore>store).state.bucket?.bucket ?? "--",
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

		getEditorText: (_: void, store?: ViewStore) => (<KVEntryStore>store).getKVSelect()?.payload ?? "",

		getParentList: (_: void, store?: KVEntryStore): KVEntriesStore => docSo.find({
			type: DOC_TYPE.KVENTRIES,
			connectionId: store.state.connectionId,
			bucket: { bucket: store.state.bucket.bucket }
		} as Partial<KVEntriesState>) as KVEntriesStore,

		getKVSelect(_: void, store?: KVEntryStore): KVEntry {
			const history = store.state.kventry?.history
			const revision = store.state.revisionSelected
			const kv = history?.find(kv => kv.revision == revision) ?? store.state.kventry
			return kv
		},
		getKVSelectIndex(_: void, store?: KVEntryStore): number {
			const current = store.state.revisionSelected ?? store.state.kventry?.revision
			return store.state.kventry?.history?.findIndex(kve => kve.revision == current) ?? -1
		}
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
			if (!!store.state.kventry?.payload) return
			await store.fetch()
		},
		fetch: async (_: void, store?: KVEntryStore) => {
			const kventry = await kventryApi.get(store.state.connectionId, store.state.bucket.bucket, store.state.kventry.key, { store })
			store.setKVEntry(kventry)
		},
		/** crea un nuovo KVENTRY */
		async save(_: void, store?: KVEntryStore) {
			const kventry = await kventryApi.put(store.state.connectionId, store.state.bucket.bucket, store.state.kventry.key, store.state.kventry.payload, { store })
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



		revisionSelect(revision: number, store?: KVEntryStore) {
			store.setRevisionSelected(revision)
			store.setHistoryOpen(false)
		},
		revisionOffset(offset: number, store?: KVEntryStore) {
			const index = store.getKVSelectIndex()
			if (index == -1) return
			const next = store.state.kventry.history[index + offset]
			if (!next) return
			store.revisionSelect(next.revision)
		}
	},

	mutators: {
		setKVEntry: (kventry: KVEntry) => ({ kventry }),
		setEditState: (editState: EDIT_STATE) => ({ editState }),
		setHistoryOpen: (historyOpen: boolean) => ({ historyOpen }),
		setRevisionSelected: (revisionSelected: number) => ({ revisionSelected }),
	},
}

export type KVEntryState = typeof setup.state & ViewState & EditorState
export type KVEntryGetters = typeof setup.getters
export type KVEntryActions = typeof setup.actions
export type KVEntryMutators = typeof setup.mutators
export interface KVEntryStore extends ViewStore, EditorStore, StoreCore<KVEntryState>, KVEntryGetters, KVEntryActions, KVEntryMutators {
	state: KVEntryState
}
const kventrySetup = mixStores(viewSetup, editorSetup, setup)
export default kventrySetup
