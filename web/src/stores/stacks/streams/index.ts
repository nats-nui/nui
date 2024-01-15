import srcIcon from "@/assets/StreamsIcon.svg"
import { COLOR_VAR } from "@/stores/layout"
import docSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { POLICY, STORAGE, Stream } from "@/types/Stream"
import { StoreCore, mixStores } from "@priolo/jon"
import strApi from "@/api/streams"
import { buildStore } from "@/stores/docs/utils/factory"
import { DOC_TYPE } from "@/types"
import { StreamState } from "./detail"
import docSo from "@/stores/docs"
import cnnSo from "@/stores/connections"



const setup = {

	state: {
		connectionId: <string>null,
		selectId: <string>null,
		all: <Stream[]>[],

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

		getById(id: string, store?: StreamsStore) {
			if (!id) return null
			return store.state.all?.find(s => s.id == id)
		},
		getIndexById(id: string, store?: StreamsStore) {
			if (!id) return null
			return store.state.all?.findIndex(s => s.id == id)
		},
	},

	actions: {
		
		select(stream: Stream, store?: StreamsStore) {
			const idSelPrev = store.state.selectId
			// se è uguale a quello precedente allora deseleziona
			let idSel = (stream && idSelPrev != stream.id) ? stream.id : null
			store.setSelectId(idSel)

			// eventualmente creo la nuova VIEW
			let streamStore:ViewStore = null
			if (idSel != null) streamStore = buildStore({
				type: DOC_TYPE.STREAM,
				stream
			} as StreamState)

			// aggiungo la nuova VIEW (o null)
			docSo.addLink({
				view: streamStore,
				parent: store,
				anim: !idSelPrev || !idSel,
			})
		},
		/** creo un nuovo STORE DETTAGLIO STREAM
		 * e lo visualizzo */
		create(_: void, store?: StreamsStore) {
			store.setSelectId(null)
			const view = buildStore({
				type: DOC_TYPE.STREAM,
				readOnly: false,
				stream: {
					name: "", description: "", storage: STORAGE.FILE,
					subjects: [], sources: [], policy: POLICY.INTEREST
				}
			} as Partial<StreamState>)
			docSo.addLink({ view, parent: store, anim: true })
		},

		async fetch(_: void, store?: StreamsStore) {
			const streams = await strApi.index(store.state.connectionId)
			store.setAll(streams)
		},
		async delete(id: string, store?: StreamsStore) {
			await strApi.remove(id)
			store.setAll(store.state.all.filter(s => s.id != id))
		},
		async save(stream: Stream, store?: StreamsStore) {
			const streamSaved = await strApi.save(stream)
			const streams = [...store.state.all]
			const index = !stream.id ? -1 : store.getIndexById(stream.id)
			if (index == -1) {
				streams.push(streamSaved)
			} else {
				streams[index] = streamSaved
			}
			store.setAll(streams)
			return streamSaved
		},


	},

	mutators: {
		setAll: (all: Stream[]) => ({ all }),
		setSelectId: (selectId: string) => ({ selectId }),
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
