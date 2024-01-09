import srcIcon from "@/assets/StreamsIcon.svg"
import { COLOR_VAR } from "@/stores/layout"
import docSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { Stream } from "@/types/Stream"
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
		async fetch(_: void, store?: StreamsStore) {
			const streams = await strApi.index()
			store.setAll(streams)
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
