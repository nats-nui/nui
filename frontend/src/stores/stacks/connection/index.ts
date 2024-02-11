import srcIcon from "@/assets/ConnectionsIcon.svg"
import cnnSo from "@/stores/connections"
import docsSo from "@/stores/docs"
import { COLOR_VAR } from "@/stores/layout"
import viewSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { StoreCore, mixStores } from "@priolo/jon"
import { buildConnection, buildConnectionMessages, buildConnectionNew } from "./utils/factory"
import { buildStreams } from "../streams/utils/factory"



/**
 * Gestione della VIEW che visualizza la lista di CONNECTIONs
 */
const setup = {

	state: {
		select: <string>null,

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
				select: state.select,
			}
		},
		//#endregion

	},

	actions: {

		//#region VIEWBASE
		setSerialization: (data: any, store?: ViewStore) => {
			viewSetup.actions.setSerialization(data, store)
			const state = store.state as CnnListState
			state.select = data.select
		},
		//#endregion

		/** apro la CARD del dettaglio */
		select(cnnId: string, store?: CnnListStore) {
			const connection = cnnSo.getById(cnnId)
			const oldId = store.state.select
    		const newId = (cnnId && oldId !== cnnId) ? cnnId : null
    		const view = newId ? buildConnection(connection) : null
    		store.setSelect(newId)
    		docsSo.addLink({ view, parent: store, anim: !oldId || !newId })
		},

		/** apro la CARD per creare un nuovo elemento */
		create(_: void, store?: CnnListStore) {
			const view = buildConnectionNew()
			docsSo.addLink({ view, parent: store, anim: true })
			store.setSelect(null)
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
		setSelect: (select: string) => ({ select }),
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


