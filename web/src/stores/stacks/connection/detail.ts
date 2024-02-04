import srcIcon from "@/assets/ConnectionIcon.svg"
import cnnSo from "@/stores/connections"
import docsSo from "@/stores/docs"
import { COLOR_VAR } from "@/stores/layout"
import viewSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { Connection } from "@/types"
import { StoreCore, mixStores } from "@priolo/jon"
import { buildBuckets, buildConnectionMessages, buildStreams } from "../../docs/utils/factory"



const setup = {

	state: {
		/** dialog SUBSCRIPTION aperta/chiusa */
		subOpen: false,
		/** connection caricata nella CARD */
		connection: <Connection>null,
		/** indica se la connection caricata nella CARD è editabile */
		readOnly: true,

		//#region VIEWBASE
		width: 200,
		colorVar: COLOR_VAR.GREEN,
		//#endregion
	},

	getters: {

		//#region VIEWBASE
		getIcon: (_: void, store?: ViewStore) => srcIcon,
		getTitle: (_: void, store?: ViewStore) => (store as CnnDetailStore).state.connection?.name ?? "--",
		getSubTitle: (_: void, store?: ViewStore) => "DETAIL",
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

		/** ripristino la CONNECTION visualizzata da quella contenuta nelle CONNECTIONS */
		restore(_: void, store?: CnnDetailStore) {
			const cnn = cnnSo.getById(store.state.connection.id)
			store.setConnection(cnn)
		},

		/** apertura della CARD MESSAGES */
		openMessages(_: void, store?: CnnDetailStore) {
			docsSo.addLink({ view: buildConnectionMessages(store.state.connection?.id), parent: store, anim: true })
		},
		/** apertura della CARD STREAMS */
		openStreams(_: void, store?: CnnDetailStore) {
			docsSo.addLink({  view: buildStreams(store.state.connection?.id),  parent: store,  anim: true  })
		},
		/** apertura della CARD BUCKETS */
		openBuckets(_: void, store?: CnnDetailStore) {
			docsSo.addLink({ view: buildBuckets(store.state.connection?.id), parent: store, anim: true })
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
