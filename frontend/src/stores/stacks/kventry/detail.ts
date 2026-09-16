import kventryApi from "@/api/kventries"
import { utils } from "@priolo/jack"
import { MESSAGE_TYPE } from "@/stores/log/utils"
import viewSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { DOC_TYPE, EDIT_STATE } from "@/types"
import { BucketState } from "@/types/Bucket"
import { KVEntry } from "@/types/KVEntry"
import { mixStores } from "@priolo/jon"
import { KVEntriesState, KVEntriesStore } from "."
import { toCborNotation } from "../../../utils/cbor"
import { MSG_FORMAT, toEditorText, toPayload } from "../../../utils/editor"
import editorSetup, { EditorState, EditorStore } from "../editorBase"
import loadBaseSetup, { LoadBaseState, LoadBaseStore } from "../loadBase"



/** KVENTRY DETAIL */
const setup = {

	state: {
		connectionId: <string>null,
		bucket: <BucketState>null,
		kventry: <KVEntry>null,

		editState: EDIT_STATE.READ,

		/** the text being edited; unset while the stored value is the one on show */
		editorText: <string>null,

		historyOpen: false,
		revisionSelected: <number>null,

		autoFormat: true,

		//#region VIEWBASE
		width: 420,
		//#endregion

		optionsOpen: false,
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

		getEditorText: (_: void, store?: ViewStore) => {
			const kvSo = <KVEntryStore>store
			if (kvSo.state.editorText != null) return kvSo.state.editorText
			const payload = kvSo.getKVSelect()?.payload ?? ""
			// editing a value means editing its text: CBOR is written as diagnostic notation
			if (kvSo.state.editState != EDIT_STATE.READ && kvSo.state.format == MSG_FORMAT.CBOR) {
				return toCborNotation(payload)
			}
			return toEditorText(payload, kvSo.state.format)
		},


		// [II] TODO
		getParentList: (_: void, store?: KVEntryStore): KVEntriesStore => utils.findInRoot(store.state.group.state.all,{
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
		},

		/** the value to store, encoded from the edited text; the stored one when nothing was edited */
		getPayloadToSave(_: void, store?: KVEntryStore): { payload?: string, error?: string } {
			if (store.state.editorText == null) return { payload: store.state.kventry?.payload ?? "" }
			return toPayload(store.state.editorText, store.state.format)
		},
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

		/** create new KVENTRY */
		async save(_: void, store?: KVEntryStore) {
			const { payload, error } = store.getPayloadToSave()
			if (error) {
				store.setSnackbar({
					open: true, type: MESSAGE_TYPE.ERROR, timeout: 4000,
					title: "NOT SAVED",
					body: error,
				})
				return
			}
			const kventry = await kventryApi.put(store.state.connectionId, store.state.bucket.bucket, store.state.kventry.key, payload, store.state.kventry.ttl, { store })

			store.setEditorText(null)
			const current = store.state.kventry
			if ( !current.history ) current.history = []
			current.history.push({ ...kventry })
			delete kventry.history
			// the API answers with the new revision, which need not carry the value back
			store.setKVEntry({ ...current, ...kventry, payload: kventry.payload ?? payload })
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
		/** reset ENTITY */
		restore: (_: void, store?: KVEntryStore) => {
			store.setEditorText(null)
			store.fetch()
			store.setEditState(EDIT_STATE.READ)
		},



		revisionSelect(revision: number, store?: KVEntryStore) {
			store.setEditorText(null)
			store.setRevisionSelected(revision)
			store.setHistoryOpen(false)
		},
		revisionOffset(offset: number, store?: KVEntryStore) {
			const index = store.getKVSelectIndex()
			if (index == -1) return
			const next = store.state.kventry.history[index + offset]
			if (!next) return
			store.revisionSelect(next.revision)
		},
	},

	mutators: {
		setKVEntry: (kventry: KVEntry) => ({ kventry }),
		setEditorText: (editorText: string) => ({ editorText }),
		setEditState: (editState: EDIT_STATE) => ({ editState }),
		setHistoryOpen: (historyOpen: boolean) => ({ historyOpen }),
		setRevisionSelected: (revisionSelected: number) => ({ revisionSelected }),
		setOptionsOpen: (optionsOpen: boolean) => ({ optionsOpen }),
	},
}

export type KVEntryState = typeof setup.state & ViewState & LoadBaseState & EditorState
export type KVEntryGetters = typeof setup.getters
export type KVEntryActions = typeof setup.actions
export type KVEntryMutators = typeof setup.mutators
export interface KVEntryStore extends ViewStore, LoadBaseStore, EditorStore, KVEntryGetters, KVEntryActions, KVEntryMutators {
	state: KVEntryState
}
const kventrySetup = mixStores(viewSetup, loadBaseSetup, editorSetup, setup)
export default kventrySetup
