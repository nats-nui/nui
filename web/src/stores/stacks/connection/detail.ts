import srcIcon from "@/assets/ConnectionIcon.svg"
import docsSo from "@/stores/docs"
import { COLOR_VAR } from "@/stores/layout"
import viewSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { Connection, DOC_TYPE } from "@/types"
import { StoreCore, mixStores } from "@priolo/jon"
import { buildStore } from "../../docs/utils/factory"
import { MessagesState, MessagesStore } from "../messages"
import { StreamsState, StreamsStore } from "../streams"
import cnnSo from "@/stores/connections"



const setup = {

	state: {
		/** dialog SUBSCRIPTION aperta/chiusa */
		subOpen: false,
		/** connection caricata nella CARD */
		connection: <Connection>null,
		/** indica se la connection caricata nella CARD è editabile */
		readOnly: true,

		//#region VIEWBASE
		//draggable: false,
		width: 200,
		//#endregion
	},

	getters: {

		//#region VIEWBASE
		getIcon: (_: void, store?: ViewStore) => srcIcon,
		getTitle: (_: void, store?: ViewStore) => (store as CnnDetailStore).state.connection?.name ?? "--",
		getSubTitle: (_: void, store?: ViewStore) => "DETAIL",
		//getColorVar: (_: void, store?: ViewStore) => COLOR_VAR.GREEN,
		//getColorBg: (_: void, store?: ViewStore) => COLOR_VAR.GREEN,
		getColorVar: (_: void, store?: ViewStore) => COLOR_VAR.GREEN,
		getSerialization: (_: void, store?: ViewStore) => {
			const state = store.state as CnnDetailState
			return {
				...viewSetup.getters.getSerialization(null, store),
				connection: state.connection,
				readOnly: state.readOnly
			}
		},
		//#endregion

	},

	actions: {
		
		//#region VIEWBASE
		setSerialization: (data: any, store?: ViewStore) => {
			viewSetup.actions.setSerialization(data, store)
			const state = store.state as CnnDetailState
			state.connection = data.connection
			state.readOnly = data.readOnly
		},
		//#endregion

		/** ripristino la CONNECTION visualizzata da quellacontenuta elle CONNECTIONS */
		restore(_: void, store?: CnnDetailStore) {
			const cnn = cnnSo.getById(store.state.connection.id)
			store.setConnection(cnn)
		},

		/** apertura della CARD MESSAGES */
		openMessages(_: void, store?: CnnDetailStore) {
			const cnn = store.state.connection
			if (!cnn) return
			const msgStore = buildStore({
				type: DOC_TYPE.MESSAGES,
				connectionId: cnn.id,
				subscriptions: [...cnn.subscriptions]
			} as MessagesState) as MessagesStore
			docsSo.addLink({
				view: msgStore,
				parent: store,
				anim: true,
			})
		},

		/** apertura della CARD STREAMS */
		openStreams(_: void, store?: CnnDetailStore) {
			const cnn = store.state.connection
			if (!cnn) return
			const msgStore = buildStore({
				type: DOC_TYPE.STREAMS,
				connectionId: cnn.id,
			} as StreamsState) as StreamsStore
			docsSo.addLink({
				view: msgStore,
				parent: store,
				anim: true,
			})
		},
	},

	mutators: {
		setConnection: (connection: Connection) => ({ connection }),
		setSubOpen: (subOpen: boolean) => ({ subOpen }),
		setReadOnly: (readOnly: boolean) => ({ readOnly }),
	},
}

export type CnnDetailState = typeof setup.state & ViewState
export type CnnDetailGetters = typeof setup.getters
export type CnnDetailActions = typeof setup.actions
export type CnnDetailMutators = typeof setup.mutators
export interface CnnDetailStore extends ViewStore, StoreCore<CnnDetailState>, CnnDetailGetters, CnnDetailActions, CnnDetailMutators {
	state: CnnDetailState
}
const srvSetup = mixStores(viewSetup, setup)
export default srvSetup
