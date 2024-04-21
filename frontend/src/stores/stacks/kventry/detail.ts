import kventryApi from "@/api/kventries"
import { findInRoot } from "@/stores/docs/utils/manage"
import { COLOR_VAR } from "@/stores/layout"
import viewSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { DOC_TYPE, EDIT_STATE } from "@/types"
import { BucketState } from "@/types/Bucket"
import { KVEntry } from "@/types/KVEntry"
import { StoreCore, mixStores } from "@priolo/jon"
import { KVEntriesState, KVEntriesStore } from "."
import editorSetup, { EditorState, EditorStore } from "../editorBase"
import loadBaseSetup, { LoadBaseState, LoadBaseStore } from "../loadBase"
import { MESSAGE_TYPE } from "@/stores/log/utils"



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
		colorVar: COLOR_VAR.MINT,
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


		// [II] TODO
		getParentList: (_: void, store?: KVEntryStore): KVEntriesStore => findInRoot(store.state.group.state.all,{
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

		//#region OVERWRITE
		setSerialization: (data: any, store?: ViewStore) => {
			viewSetup.actions.setSerialization(data, store)
			const state = store.state as KVEntryState
			state.connectionId = data.connectionId
			state.bucket = data.bucket
			state.kventry = data.kventry
			state.editState = data.editState
		},
		fetch: async (_: void, store?: LoadBaseStore) => {
			const s = <KVEntryStore>store
			const kventry = await kventryApi.get(s.state.connectionId, s.state.bucket.bucket, s.state.kventry.key, { store, manageAbort: true })
			s.setKVEntry(kventry)
			await loadBaseSetup.actions.fetch(_, store)
		},
		//#endregion



		async fetchIfVoid(_: void, store?: KVEntryStore) {
			if (!!store.state.kventry?.payload || store.state.editState == EDIT_STATE.NEW) return
			await store.fetch()
		},

		/** crea un nuovo KVENTRY */
		async save(_: void, store?: KVEntryStore) {
			const kventry = await kventryApi.put(store.state.connectionId, store.state.bucket.bucket, store.state.kventry.key, store.state.kventry.payload, { store })

			const current = store.state.kventry
			if ( !current.history ) current.history = []
			current.history.push({ ...kventry })
			delete kventry.history
			store.setKVEntry({ ...current, ...kventry })
			store.setRevisionSelected(kventry.revision)

			store.getParentList()?.fetch()
			store.getParentList()?.setSelect(kventry.key)
			store.setEditState(EDIT_STATE.READ)

			store.setSnackbar({
				open: true, type: MESSAGE_TYPE.SUCCESS, timeout: 5000,
				title: "SAVED",
				body: "you have it on the KVENTRY list",
			})
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

export type KVEntryState = typeof setup.state & ViewState & LoadBaseState & EditorState
export type KVEntryGetters = typeof setup.getters
export type KVEntryActions = typeof setup.actions
export type KVEntryMutators = typeof setup.mutators
export interface KVEntryStore extends ViewStore, LoadBaseStore, EditorStore, StoreCore<KVEntryState>, KVEntryGetters, KVEntryActions, KVEntryMutators {
	state: KVEntryState
}
const kventrySetup = mixStores(viewSetup, loadBaseSetup, editorSetup, setup)
export default kventrySetup
