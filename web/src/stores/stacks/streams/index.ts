import strApi from "@/api/streams"
import srcIcon from "@/assets/StreamsIcon.svg"
import cnnSo from "@/stores/connections"
import docSo from "@/stores/docs"
import { buildConsumers, buildStore, buildStreamMessages } from "@/stores/docs/utils/factory"
import { COLOR_VAR } from "@/stores/layout"
import { ViewState, ViewStore, default as docSetup, default as viewSetup } from "@/stores/stacks/viewBase"
import { DOC_TYPE } from "@/types"
import { StreamInfo } from "@/types/Stream"
import { StoreCore, mixStores } from "@priolo/jon"
import { StreamState } from "./detail"
import { buildNewStreamInfo } from "./utils/factory"



/** STREAMS COLLECTION */
const setup = {

	state: {
		connectionId: <string>null,
		/** nome dello STREAM selezionato */
		select: <string>null,
		all: <StreamInfo[]>[],

		//#region VIEWBASE
		width: 300,
		colorVar: COLOR_VAR.YELLOW,
		//#endregion
	},

	getters: {

		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) => cnnSo.getById((<StreamsStore>store).state.connectionId)?.name,
		getSubTitle: (_: void, store?: ViewStore) => "STREAMS",
		getIcon: (_: void, store?: ViewStore) => srcIcon,
		getSerialization: (_: void, store?: ViewStore) => {
			const state = store.state as StreamsState
			return {
				...viewSetup.getters.getSerialization(null, store),
				connectionId: state.connectionId,
				select: state.select,
			}
		},
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

		//#region VIEWBASE
		setSerialization: (data: any, store?: ViewStore) => {
			viewSetup.actions.setSerialization(data, store)
			const state = store.state as StreamsState
			state.connectionId = data.connectionId
			state.select = data.select
		},
		//#endregion

		/** visualizzo dettaglio di uno STREAM */
		select(name: string, store?: StreamsStore) {
			const nameOld = store.state.select
			// se è uguale a quello precedente allora deseleziona
			let nameNew = (name && nameOld != name) ? name : null
			store.setSelect(nameNew)

			// eventualmente creo la nuova VIEW
			let streamStore: ViewStore = null
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
				stream: buildNewStreamInfo(),
				readOnly: false,
			} as Partial<StreamState>)
			docSo.addLink({ view, parent: store, anim: true })
		},

		/** apertura della CARD CONSUMERS */
		openConsumers(streamName: string, store?: StreamsStore) {
			docSo.addLink({ 
				view: buildConsumers(store.state.connectionId, store.getByName(streamName)), 
				parent: store, 
				anim: true 
			})
		},
		/** apertura della CARD MESSAGES */
		openMessages(streamName: string, store?: StreamsStore) {
			docSo.addLink({ 
				view: buildStreamMessages(store.state.connectionId, store.getByName(streamName)), 
				parent: store, 
				anim: true 
			})
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
