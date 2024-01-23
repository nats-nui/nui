import { COLOR_VAR } from "@/stores/layout"
import viewSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { StreamConfig, StreamInfo } from "@/types/Stream"
import { StoreCore, mixStores } from "@priolo/jon"
import srcIcon from "@/assets/StreamsIcon.svg"
import { StreamsStore } from "."
import strApi from "@/api/streams"



/** STREAM DETAIL */
const setup = {

	state: {
		/** la CONNECTION che contiene sto STREAM */
		connectionId: <string>null,

		streams:<string[]>["pippo","pluto","paperino"],

		/** STREAM caricata nella CARD */
		stream: <StreamInfo>null,
		/** STREAM è editabile? */
		readOnly: true,

		//#region VIEWBASE
		//draggable: false,
		width: 230,
		//#endregion

	},

	getters: {

		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) => (<StreamStore>store).state.stream?.config.name ?? "--",
		getSubTitle: (_: void, store?: ViewStore) => "STREAM DETAIL",
		getIcon: (_: void, store?: ViewStore) => srcIcon,
		getColorVar: (_: void, store?: ViewStore) => COLOR_VAR.YELLOW,
		getSerialization: (_: void, store?: ViewStore) => {
			const state = store.state as StreamState
			return {
				...viewSetup.getters.getSerialization(null, store),
				stream: state.stream,
				readOnly: state.readOnly,
			}
		},
		//#endregion

		// [II] da modificare in maniera da rintracciare sempre gli STREAMS di quata connectionId
		getStreamsStore: (_: void, store?: StreamStore) => {
			return store.state.parent as StreamsStore
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
		
		restore: (_: void, store?: StreamStore) => {
			const parent = store.state.parent as StreamsStore
			const stream = parent.getByName(store.state.stream.config.name)
			store.setStream(stream)
		},

		async create(_:void, store?: StreamStore) {
			const streamSaved = await strApi.create(store.state.connectionId, store.state.stream.config)
			store.setStream(streamSaved)
			const streamsSo = store.getStreamsStore()
			streamsSo.update(streamSaved)
		},
	},

	mutators: {
		setStream: (stream: StreamInfo) => ({ stream }),
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
