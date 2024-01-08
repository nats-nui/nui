import { COLOR_VAR } from "@/stores/layout"
import viewSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { Stream } from "@/types/Stream"
import { StoreCore, mixStores } from "@priolo/jon"
import { buildNewStream } from "./utils"
import srcIcon from "@/assets/StreamsIcon.svg"



const setup = {

	state: {
		/** STREAM caricata nella CARD */
		stream: <Stream>null,
		/** STREAM è editabile? */
		readOnly: true,

		//#region VIEWBASE
		//draggable: false,
		width: 230,
		//#endregion

	},

	getters: {

		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) => (<StreamStore>store).state.stream?.name ?? "--",
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

	},

	actions: {

		//#region VIEWBASE
		setSerialization: (data: any, store?: ViewStore) => {
			viewSetup.actions.setSerialization(data, store)
			const state = store.state as StreamState
			state.stream = data.stream
			state.readOnly = data.readOnly
		},
		//#endregion

		createNew: (_: void, store?: StreamStore) => {
			const stream = buildNewStream()
		},

	},

	mutators: {
		setStream: (stream: Stream) => ({ stream }),
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
