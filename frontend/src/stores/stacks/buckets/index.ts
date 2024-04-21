import bucketApi from "@/api/buckets"
import cnnSo from "@/stores/connections"
import { COLOR_VAR } from "@/stores/layout"
import { ViewState, ViewStore, default as docSetup, default as viewSetup } from "@/stores/stacks/viewBase"
import { BucketState } from "@/types/Bucket"
import { StoreCore, mixStores } from "@priolo/jon"
import loadBaseSetup, { LoadBaseState, LoadBaseStore } from "../loadBase"
import { buildBucket, buildBucketNew } from "./utils/factory"
import { MESSAGE_TYPE } from "@/stores/log/utils"
import { findAll } from "@/stores/docs/utils/manage"
import { GetAllCards } from "@/stores/docs/cards"
import { DOC_TYPE } from "@/types"



/** BUCKETS COLLECTION */
const setup = {

	state: {
		/** connessione di riferimento */
		connectionId: <string>null,
		/** elemento selezionato */
		select: <string>null,
		/** all elements */
		all: <BucketState[]>null,
		textSearch: <string>null,

		//#region VIEWBASE
		width: 310,
		colorVar: COLOR_VAR.MINT,
		//#endregion
	},

	getters: {

		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) => "BUCKETS",
		getSubTitle: (_: void, store?: ViewStore) => cnnSo.getById((<BucketsStore>store).state.connectionId)?.name,
		getSerialization: (_: void, store?: ViewStore) => {
			const state = store.state as BucketsState
			return {
				...viewSetup.getters.getSerialization(null, store),
				connectionId: state.connectionId,
				select: state.select,
			}
		},
		//#endregion

		getByName(name: string, store?: BucketsStore) {
			if (!name) return null
			return store.state.all?.find(s => s.bucket == name)
		},
		getIndexByName(name: string, store?: BucketsStore) {
			if (!name) return -1
			return store.state.all?.findIndex(s => s.bucket == name)
		},
		/** filtrati e da visualizzare in lista */
		getFiltered(_: void, store?: BucketsStore) {
			const text = store.state.textSearch?.toLocaleLowerCase()?.trim()
			if (!text || text.trim().length == 0 || !store.state.all) return store.state.all
			return store.state.all.filter(bucket =>
				bucket.bucket.toLowerCase().includes(text)
			)
		}
	},

	actions: {

		//#region OVERWRITE
		setSerialization: (data: any, store?: ViewStore) => {
			viewSetup.actions.setSerialization(data, store)
			const state = store.state as BucketsState
			state.connectionId = data.connectionId
			state.select = data.select
		},
		async fetch(_: void, store?: LoadBaseStore) {
			const s = <BucketsStore>store
			const buckets = await bucketApi.index(s.state.connectionId, { store, manageAbort: true })
			s.setAll(buckets)
			await loadBaseSetup.actions.fetch(_, store)
		},
		//#endregion

		async fetchIfVoid(_: void, store?: BucketsStore) {
			if (!!store.state.all) return
			await store.fetch()
		},
		/** apro la CARD per creare un nuovo elemento */
		create(_: void, store?: BucketsStore) {
			const view = buildBucketNew(store.state.connectionId)
			store.state.group.addLink({ view, parent: store, anim: true })
			store.setSelect(null)
		},
		async delete(_: void, store?: BucketsStore) {
			if (!await store.alertOpen({
				title: "BUCKET DELETION",
				body: "This action is irreversible.\nAre you sure you want to delete the BUCKET?",
			})) return

			const name = store.state.select
			await bucketApi.remove(store.state.connectionId, name, { store })
			store.setAll(store.state.all.filter(b => b.bucket != name))
			store.setSelect(null)

			// cerco eventuali CARD di questo stream e lo chiudo
			const cardStreams = findAll(GetAllCards(), { type: DOC_TYPE.BUCKET, connectionId: store.state.connectionId })
			cardStreams.forEach(view => view.state.group.remove({ view, anim: true }))

			store.setSnackbar({
				open: true, type: MESSAGE_TYPE.SUCCESS, timeout: 5000,
				title: "DELETED",
				body: "it is gone forever",
			})
		},



		update(bucket: BucketState, store?: BucketsStore) {
			const all = [...store.state.all]
			const index = store.getIndexByName(bucket.bucket)
			index == -1 ? all.push(bucket) : (all[index] = { ...all[index], ...bucket })
			store.setAll(all)
		},
		/** apro la CARD del dettaglio */
		select(name: string, store?: BucketsStore) {
			const nameOld = store.state.select
			const nameNew = (name && nameOld !== name) ? name : null
			const view = nameNew ? buildBucket(store.state.connectionId, store.getByName(nameNew)) : null
			store.setSelect(nameNew)
			store.state.group.addLink({ view, parent: store, anim: !nameOld || !nameNew })
		},
	},

	mutators: {
		setAll: (all: BucketState[]) => ({ all }),
		setSelect: (select: string) => ({ select }),
		setTextSearch: (textSearch: string) => ({ textSearch }),
	},
}

export type BucketsState = typeof setup.state & ViewState & LoadBaseState
export type BucketsGetters = typeof setup.getters
export type BucketsActions = typeof setup.actions
export type BucketsMutators = typeof setup.mutators
export interface BucketsStore extends ViewStore, LoadBaseStore, StoreCore<BucketsState>, BucketsGetters, BucketsActions, BucketsMutators {
	state: BucketsState
}
const bucketsSetup = mixStores(docSetup, loadBaseSetup, setup)
export default bucketsSetup
