import { COLOR_VAR } from "@/stores/layout"
import viewSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { StreamConfig, StreamInfo } from "@/types/Stream"
import { StoreCore, mixStores } from "@priolo/jon"
import srcIcon from "@/assets/StreamsIcon.svg"
import { StreamsStore } from "."
import strApi from "@/api/streams"
import docSo from "@/stores/docs"
import { DOC_TYPE } from "@/types"
import { buildStore } from "@/stores/docs/utils/factory"
import { ConsumersState, ConsumersStore } from "../consumer"
import { StreamMessagesState, StreamMessagesStore } from "./messages"



/** STREAM DETAIL */
const setup = {

	state: {
		/** la CONNECTION che contiene sto STREAM */
		connectionId: <string>null,

		/** sono gli stream presenti nella stessa connection di questo */
		allStreams: <string[]>null,

		/** STREAM caricata nella CARD */
		stream: <StreamInfo>null,
		/** STREAM è editabile? */
		readOnly: true,

		//#region VIEWBASE
		colorVar: COLOR_VAR.YELLOW,
		width: 230,
		//#endregion

	},

	getters: {

		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) => (<StreamStore>store).state.stream?.config.name ?? "--",
		getSubTitle: (_: void, store?: ViewStore) => "STREAM DETAIL",
		getIcon: (_: void, store?: ViewStore) => srcIcon,
		getSerialization: (_: void, store?: ViewStore) => {
			const state = store.state as StreamState
			return {
				...viewSetup.getters.getSerialization(null, store),
				connectionId: state.connectionId,
				stream: state.stream,
				readOnly: state.readOnly,
			}
		},
		//#endregion

		/** restituische, se èresenta, la lista degli streams che contiene questo stream */
		getStreamsStore: (_: void, store?: StreamStore) => {
			if (store.state.parent) return store.state.parent as StreamsStore
			return docSo.find({
				type: DOC_TYPE.STREAMS,
				connectionId: store.state.connectionId,
			}) as StreamsStore
		},
		/** restituisce se lo stream è nuovo (true) oppure no (false) */
		isNew: (_: void, store?: StreamStore) => {
			return store.state.stream.state == null
		},

	},

	actions: {

		//#region VIEWBASE
		setSerialization: (data: any, store?: ViewStore) => {
			viewSetup.actions.setSerialization(data, store)
			const state = store.state as StreamState
			state.connectionId = data.connectionId
			state.stream = data.stream
			state.readOnly = data.readOnly
		},
		//#endregion

		/** va aprendersi i valori originali e ripristina lo STREAM */
		restore: (_: void, store?: StreamStore) => {
			const stream = store.getStreamsStore()?.getByName(store.state.stream.config.name)
			store.setStream(stream)
		},

		/** crea un nuovo STREAM-INFO tramite STREAM-CONFIG */
		async save(_: void, store?: StreamStore) {
			let streamSaved = null
			if (store.isNew()) {
				streamSaved = await strApi.create(store.state.connectionId, store.state.stream.config)
			} else {
				streamSaved = await strApi.update(store.state.connectionId, store.state.stream.config)
			}
			store.setStream(streamSaved)
			store.getStreamsStore()?.update(streamSaved)
		},

		/** carico tutti i dati dello STREAM se ce ne fosse bisogno */
		fetch: async (_: void, store?: StreamStore) => {
			// se non ci sono i NAMES degli STREAMS fratelli allora li cerco
			if (!store.state.allStreams) {
				const parent = store.getStreamsStore()
				const streams = parent?.state.all ?? await strApi.index(store.state.connectionId)
				const allStreams = streams?.map(si => si.config.name) ?? []
				store.setAllStreams(allStreams)
			}
			// verifico che ci siano i dati del dettaglio dello STREAM
			// TO DO
		},

		/** apertura della CARD CONSUMERS */
		openConsumers(_: void, store?: StreamStore) {
			if (!store.state.stream?.config?.name) return
			const consumerStore = buildStore({
				type: DOC_TYPE.CONSUMERS,
				connectionId: store.state.connectionId,
				streamName: store.state.stream.config.name,
			} as ConsumersState) as ConsumersStore
			docSo.addLink({
				view: consumerStore,
				parent: store,
				anim: true,
			})
		},
		/** apertura della CARD MESSAGES */
		openMessages(_: void, store?: StreamStore) {
			if (!store.state.stream?.config?.name || !store.state.connectionId) {
				console.error("no param")
				return
			}
			const streamMessagesStore = buildStore({
				type: DOC_TYPE.STREAM_MESSAGES,
				connectionId: store.state.connectionId,
				stream: store.state.stream,
				subjects: [...(store.state.stream?.config?.subjects ?? [])]
			} as StreamMessagesState) as StreamMessagesStore
			docSo.addLink({
				view: streamMessagesStore,
				parent: store,
				anim: true,
			})
		},
	},

	mutators: {
		setStream: (stream: StreamInfo) => ({ stream }),
		setAllStreams: (allStreams: string[]) => ({ allStreams }),
		setStreamConfig: (config: StreamConfig, store?: StreamStore) => ({ stream: { ...store.state.stream, config } }),
		setReadOnly: (readOnly: boolean) => ({ readOnly }),
	},
}

export type StreamState = typeof setup.state & ViewState
export type StreamGetters = typeof setup.getters
export type StreamActions = typeof setup.actions
export type StreamMutators = typeof setup.mutators
export interface StreamStore extends ViewStore, StoreCore<StreamState>, StreamGetters, StreamActions, StreamMutators {
	state: StreamState
}
const streamSetup = mixStores(viewSetup, setup)
export default streamSetup
