import cnnSo from "@/stores/connections"
import { COLOR_VAR } from "@/stores/layout"
import viewSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { StoreCore, mixStores } from "@priolo/jon"
import { buildStreams } from "../streams/utils/factory"
import { buildConnection, buildConnectionMessages, buildConnectionNew } from "./utils/factory"
import { CnnDetailStore } from "./detail"



/**
 * Gestione della VIEW che visualizza la lista di CONNECTIONs
 */
const setup = {

	state: {
		//#region VIEWBASE
		width: 220,
		colorVar: COLOR_VAR.GREEN,
		pinnable: false,
		//#endregion
	},

	getters: {

		//#region OVERRIDE
		getTitle: (_: void, store?: ViewStore) => "CONNECTIONS",
		getSubTitle: (_: void, store?: ViewStore) => "All connections available",
		getSerialization: (_: void, store?: ViewStore) => {
			const state = store.state as CnnListState
			return {
				...viewSetup.getters.getSerialization(null, store),
			}
		},
		//#endregion

	},

	actions: {

		//#region OVERRIDE
		setSerialization: (data: any, store?: ViewStore) => {
			viewSetup.actions.setSerialization(data, store)
			const state = store.state as CnnListState
		},
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


