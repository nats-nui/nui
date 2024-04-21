import kventryApi from "@/api/kventries"
import cnnSo from "@/stores/connections"
import { COLOR_VAR } from "@/stores/layout"
import { ViewState, ViewStore, default as viewSetup } from "@/stores/stacks/viewBase"
import { BucketState } from "@/types/Bucket"
import { KVEntry } from "@/types/KVEntry"
import { StoreCore, mixStores } from "@priolo/jon"
import loadBaseSetup, { LoadBaseState, LoadBaseStore } from "../loadBase"
import { buildKVEntry, buildKVEntryNew } from "./utils/factory"
import { MESSAGE_TYPE } from "@/stores/log/utils"
import { findAll } from "@/stores/docs/utils/manage"
import { GetAllCards } from "@/stores/docs/cards"
import { DOC_TYPE } from "@/types"



/** BUCKETS COLLECTION */
const setup = {

	state: {
		/** connessione di riferimento */
		connectionId: <string>null,
		bucket: <BucketState>null,
		/** nome del BUCKET selezionato */
		select: <string>null,
		all: <KVEntry[]>null,
		textSearch: <string>null,

		//#region VIEWBASE
		width: 340,
		colorVar: COLOR_VAR.MINT,
		//#endregion
	},

	getters: {

		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) => "KVENTRIES",
		getSubTitle: (_: void, store?: ViewStore) => cnnSo.getById((<KVEntriesStore>store).state.connectionId)?.name ?? "--",
		getSerialization: (_: void, store?: ViewStore) => {
			const state = store.state as KVEntriesState
			return {
				...viewSetup.getters.getSerialization(null, store),
				connectionId: state.connectionId,
				bucket: state.bucket,
				select: state.select,
			}
		},
		//#endregion

		getByName(key: string, store?: KVEntriesStore) {
			if (!key) return null
			return store.state.all?.find(s => s.key == key)
		},
		getIndexByName(name: string, store?: KVEntriesStore) {
			if (!name) return -1
			return store.state.all?.findIndex(s => s.key == name)
		},

		/** gli STREAM filtrati e da visualizzare in lista */
		getFiltered(_: void, store?: KVEntriesStore) {
			const text = store.state.textSearch?.toLocaleLowerCase()?.trim()
			if (!text || text.trim().length == 0 || !store.state.all) return store.state.all
			return store.state.all.filter(kventry =>
				kventry.key.toLowerCase().includes(text)
			)
		}
	},

	actions: {

		//#region OVERWRITE
		setSerialization: (data: any, store?: ViewStore) => {
			viewSetup.actions.setSerialization(data, store)
			const state = store.state as KVEntriesState
			state.connectionId = data.connectionId
			state.bucket = data.bucket
			state.select = data.select
		},
		async fetch(_: void, store?: LoadBaseStore) {
			const s = <KVEntriesStore>store
			const kventries = await kventryApi.index(s.state.connectionId, s.state.bucket.bucket, { store, manageAbort: true })
			s.setAll(kventries)
			await loadBaseSetup.actions.fetch(_, store)
		},
		//#endregion

		async fetchIfVoid(_: void, store?: KVEntriesStore) {
			if (!!store.state.all) return
			await store.fetch()
		},

		async create(_: void, store?: KVEntriesStore) {
			const view = buildKVEntryNew(store.state.connectionId, store.state.bucket)
			store.state.group.addLink({ view, parent: store, anim: true })
			store.setSelect(null)
		},
		async delete(_: void, store?: KVEntriesStore) {
			if (!await store.alertOpen({
				title: "KVENTRY DELETION",
				body: "This action is irreversible.\nAre you sure you want to delete the KVENTRY?",
			})) return

			const key = store.state.select
			await kventryApi.remove(store.state.connectionId, store.state.bucket.bucket, key, { store })
			store.setAll(store.state.all.filter(entry => entry.key != key))
			store.setSelect(null)

			// cerco eventuali CARD di questo stream e lo chiudo
			const cardStreams = findAll(GetAllCards(), { type: DOC_TYPE.KVENTRY, bucket: { bucket: store.state.bucket.bucket } })
			cardStreams.forEach(view => view.state.group.remove({ view, anim: true }))

			store.setSnackbar({
				open: true, type: MESSAGE_TYPE.SUCCESS, timeout: 5000,
				title: "DELETED",
				body: "it is gone forever",
			})
		},

		async purge(_: void, store?: KVEntriesStore) {
			if (!await store.alertOpen({
				title: "KVENTRY PURGE",
				body: "This action is irreversible.\nAre you sure you want to purge the KVENTRY?",
			})) return

			const key = store.state.select
			await kventryApi.purge(store.state.connectionId, store.state.bucket.bucket, key, { store })
			store.setAll(store.state.all.filter(entry => entry.key != key))
			store.setSelect(null)

			store.setSnackbar({
				open: true, type: MESSAGE_TYPE.SUCCESS, timeout: 5000,
				title: "PURGED",
				body: "you will never see those ENTRY again",
			})
		},

		/** apro la CARD del dettaglio */
		select(key: string, store?: KVEntriesStore) {
			const oldkey = store.state.select
			const newKey = (key && oldkey !== key) ? key : null
			const view = newKey ? buildKVEntry(store.state.connectionId, store.state.bucket, store.getByName(key)) : null
			store.setSelect(newKey)
			store.state.group.addLink({ view, parent: store, anim: !oldkey || !newKey })
		},
	},

	mutators: {
		setAll: (all: KVEntry[]) => ({ all }),
		setSelect: (select: string) => ({ select }),
		setTextSearch: (textSearch: string) => ({ textSearch }),
	},
}

export type KVEntriesState = typeof setup.state & ViewState & LoadBaseState
export type KVEntriesGetters = typeof setup.getters
export type KVEntriesActions = typeof setup.actions
export type KVEntriesMutators = typeof setup.mutators
export interface KVEntriesStore extends ViewStore, LoadBaseStore, StoreCore<KVEntriesState>, KVEntriesGetters, KVEntriesActions, KVEntriesMutators {
	state: KVEntriesState
}
const kventriesSetup = mixStores(viewSetup, loadBaseSetup, setup)
export default kventriesSetup
