import srcIcon from "@/assets/ConnectionsIcon.svg"
import cnnSo from "@/stores/connections"
import docsSo from "@/stores/docs"
import { COLOR_VAR } from "@/stores/layout"
import viewSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { StoreCore, mixStores } from "@priolo/jon"
import { buildConnection, buildConnectionMessages, buildConnectionNew, buildStreams } from "../../docs/utils/factory"



/**
 * Gestione della VIEW che visualizza la lista di CONNECTIONs
 */
const setup = {

	state: {
		selectId: <string>null,

		//#region VIEWBASE
		width: 220,
		iconizzable: false,
		colorVar: COLOR_VAR.GREEN,
		//#endregion
	},

	getters: {

		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) => "CONNECTIONS",
		getIcon: (_: void, store?: ViewStore) => srcIcon,
		getSerialization: (_: void, store?: ViewStore) => {
			const state = store.state as CnnListState
			return {
				...viewSetup.getters.getSerialization(null, store),
				selectId: state.selectId,
			}
		},
		//#endregion

	},

	actions: {

		//#region VIEWBASE
		setSerialization: (data: any, store?: ViewStore) => {
			viewSetup.actions.setSerialization(data, store)
			const state = store.state as CnnListState
			state.selectId = data.selectId
		},
		//#endregion

		/** apro la CARD del dettaglio */
		select(cnnId: string, store?: CnnListStore) {
			const connection = cnnSo.getById(cnnId)
			const oldId = store.state.selectId
    		const newId = (cnnId && oldId !== cnnId) ? cnnId : null
    		const view = newId ? buildConnection(connection) : null
    		store.setSelect(newId)
    		docsSo.addLink({ view, parent: store, anim: !oldId || !newId })
		},

		/** apro la CARD per creare un nuovo elemento */
		create(_: void, store?: CnnListStore) {
			const view = buildConnectionNew()
			docsSo.addLink({ view, parent: store, anim: true })
		},



		openStreams(connectionId: string, store?: CnnListStore) {
			docsSo.addLink({
				view: buildStreams(connectionId),
				parent: store,
				anim: true
			})
		},

		openMessages(connectionId: string, store?: CnnListStore) {
			docsSo.addLink({
				view: buildConnectionMessages(connectionId),
				parent: store,
				anim: true
			})
		},
	},

	mutators: {
		setSelect: (selectId: string, store?: CnnListStore) => ({ selectId }),
	},
}

export type CnnListState = typeof setup.state & ViewState
export type CnnListGetters = typeof setup.getters
export type CnnListActions = typeof setup.actions
export type CnnListMutators = typeof setup.mutators
export interface CnnListStore extends ViewStore, StoreCore<CnnListState>, CnnListGetters, CnnListActions, CnnListMutators {
	state: CnnListState
}
const cnnSetup = mixStores(viewSetup, setup)
export default cnnSetup


