import strApi from "@/api/streams"
import srcIcon from "@/assets/StreamsIcon.svg"
import cnnSo from "@/stores/connections"
import docSo from "@/stores/docs"
import { buildStore } from "@/stores/docs/utils/factory"
import { COLOR_VAR } from "@/stores/layout"
import docSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { DOC_TYPE } from "@/types"
import { StreamInfo } from "@/types/Stream"
import { StoreCore, mixStores } from "@priolo/jon"
import { StreamState } from "./detail"
import { buildNew } from "./utils"



/** STREAMS COLLECTION */
const setup = {

	state: {
		connectionId: <string>null,
		/** nome dello STREAM selezionato */
		select: <string>null,
		all: <StreamInfo[]>[],

		//#region VIEWBASE
		width: 200,
		//#endregion
	},

	getters: {
		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) => cnnSo.getById((<StreamsStore>store).state.connectionId)?.name,
		getSubTitle: (_: void, store?: ViewStore) => "STREAMS",
		getIcon: (_: void, store?: ViewStore) => srcIcon,
		getColorVar: (_: void, store?: ViewStore) => COLOR_VAR.YELLOW,
		//#endregion

		getByName(name: string, store?: StreamsStore) {
			if (!name) return null
			return store.state.all?.find(s => s.config.name == name)
		},
		getIndexByName(name: string, store?: StreamsStore) {
			if (!name) return null
			return store.state.all?.findIndex(s => s.config.name == name)
		},
	},

	actions: {

		/** visualizzo dettaglio di uno STREAM */
		select(name: string, store?: StreamsStore) {
			const nameOld = store.state.select
			// se è uguale a quello precedente allora deseleziona
			let nameNew = (name && nameOld != name) ? name : null
			store.setSelect(nameNew)

			// eventualmente creo la nuova VIEW
			let streamStore:ViewStore = null
			if (nameNew != null) streamStore = buildStore({
				type: DOC_TYPE.STREAM,
				connectionId: store.state.connectionId,
				stream: store.getByName(nameNew),
				readOnly: true,
			} as StreamState)

			// aggiungo la nuova VIEW (o null)
			docSo.addLink({
				view: streamStore,
				parent: store,
				anim: !nameOld || !nameNew,
			})
		},

		/** visualizza nuovo STORE DETTAGLIO STREAM */
		create(_: void, store?: StreamsStore) {
			store.setSelect(null)
			const view = buildStore({
				type: DOC_TYPE.STREAM,
				connectionId: store.state.connectionId,
				stream: buildNew(),
				readOnly: false,
			} as Partial<StreamState>)
			docSo.addLink({ view, parent: store, anim: true })
		},


		async fetch(_: void, store?: StreamsStore) {
			const streams = await strApi.index(store.state.connectionId)
			store.setAll(streams)
		},
		async delete(name: string, store?: StreamsStore) {
			await strApi.remove(store.state.connectionId, name)
			store.setAll(store.state.all.filter(s => s.config.name != name))
		},
		update(stream: StreamInfo, store?: StreamsStore) {
			const all = [...store.state.all]
			const index = !stream.state ? -1 : store.getIndexByName(stream.config.name)
			if (index == -1) {
				all.push(stream)
			} else {
				all[index] = { ...all[index], ...stream }
			}
			store.setAll(all)
		},
		

	},

	mutators: {
		setAll: (all: StreamInfo[]) => ({ all }),
		setSelect: (select: string) => ({ select }),
	},
}

export type StreamsState = typeof setup.state & ViewState
export type StreamsGetters = typeof setup.getters
export type StreamsActions = typeof setup.actions
export type StreamsMutators = typeof setup.mutators
export interface StreamsStore extends ViewStore, StoreCore<StreamsState>, StreamsGetters, StreamsActions, StreamsMutators {
	state: StreamsState
}
const streamsSetup = mixStores(docSetup, setup)
export default streamsSetup
