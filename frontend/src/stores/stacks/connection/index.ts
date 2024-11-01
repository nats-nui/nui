import cnnSo from "@/stores/connections"
import viewSetup from "@/stores/stacks/viewBase"
import { ViewState, ViewStore } from "@priolo/jack"
import { mixStores } from "@priolo/jon"
import { DOC_TYPE } from "../../docs/types"
import { buildStore } from "../../docs/utils/factory"
import { CnnLoaderState, CnnLoaderStore } from "../connectionLoader"
import { buildStreams } from "../streams/utils/factory"
import { CnnDetailStore } from "./detail"
import { buildConnection, buildConnectionMessages, buildConnectionNew } from "./utils/factory"



/**
 * Gestione della VIEW che visualizza la lista di CONNECTIONs
 */
const setup = {

	state: {
		//#region VIEWBASE
		width: 220,
		pinnable: false,
		//#endregion
	},

	getters: {

		//#region OVERRIDE
		getTitle: (_: void, store?: ViewStore) => "CONNECTIONS",
		getSubTitle: (_: void, store?: ViewStore):string => "All connections available",
		// getSerialization: (_: void, store?: ViewStore) => {
		// 	const state = store.state as CnnListState
		// 	return {
		// 		...viewSetup.getters.getSerialization(null, store),
		// 	}
		// },
		//#endregion

	},

	actions: {

		//#region OVERRIDE
		// setSerialization: (data: any, store?: ViewStore) => {
		// 	viewSetup.actions.setSerialization(data, store)
		// 	const state = store.state as CnnListState
		// },
		//#endregion

		/** apro/chiudo la CARD del dettaglio */
		select(cnnId: string, store?: CnnListStore) {
			const connection = cnnSo.getById(cnnId)
			const oldId = (store.state.linked as CnnDetailStore)?.state.connection?.id
			const newId = (cnnId && oldId !== cnnId) ? cnnId : null
			const view = newId ? buildConnection(connection) : null
			store.setSelect(newId)
			store.state.group.addLink({ view, parent: store, anim: !oldId || !newId })
		},

		/** apro la CARD per creare un nuovo elemento */
		create(_: void, store?: CnnListStore) {
			const view = buildConnectionNew()
			store.state.group.addLink({ view, parent: store, anim: true })
			store.setSelect(null)
		},



		openStreams(connectionId: string, store?: CnnListStore) {
			store.state.group.addLink({
				view: buildStreams(connectionId),
				parent: store,
				anim: true
			})
		},

		openMessages(connectionId: string, store?: CnnListStore) {
			store.state.group.addLink({
				view: buildConnectionMessages(connectionId),
				parent: store,
				anim: true
			})
		},



		/** apertura della CARD JSON CONFIG */
		openLoader(_: void, store?: CnnDetailStore) {
			// se è già aperta la chiudo
			const configOpen = store.state.linked?.state.type == DOC_TYPE.CNN_LOADER
			if (configOpen) {
				store.state.group.addLink({ view: null, parent: store, anim: true })
				return
			}
			const configStore = buildStore({
				type: DOC_TYPE.CNN_LOADER,
				path: "",
				imports: [],
			} as CnnLoaderState) as CnnLoaderStore;
			store.state.group.addLink({ view: configStore, parent: store, anim: true })
		},
	},

	mutators: {
		setSelect: (select: string) => ({ select }),
	},
}

export type CnnListState = typeof setup.state & ViewState
export type CnnListGetters = typeof setup.getters
export type CnnListActions = typeof setup.actions
export type CnnListMutators = typeof setup.mutators
export interface CnnListStore extends ViewStore, CnnListGetters, CnnListActions, CnnListMutators {
	state: CnnListState
}
const cnnSetup = mixStores(viewSetup, setup)
export default cnnSetup