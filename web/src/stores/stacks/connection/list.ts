import srcIcon from "@/assets/connections-icon.svg"
import docsSo from "@/stores/docs"
import docSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { DOC_TYPE } from "@/types"
import { Connection } from "@/types/Connection"
import { StoreCore, mixStores } from "@priolo/jon"
import { buildStore } from "../../docs/utils/factory"
import { CnnDetailState } from "./detail"
import { COLOR_VAR } from "@/stores/layout"



export enum CONNECTIONS_PARAMS {
	/** l'uuid della CONNECTION selezionata */
	SELECT_ID = "slc"
}

/**
 * Gestione della VIEW che visualizza la lista di CONNECTIONs
 */
const setup = {

	state: {
		params: {
			[CONNECTIONS_PARAMS.SELECT_ID]: <string[]>null
		},
		//#region VIEWBASE
		width: 220,
		//#endregion
	},

	getters: {
		/** l'id della CONNECTION attualmente selezionata */
		getSelectId(_: void, store?: CnnListStore): string {
			return docSetup.getters.getParam(CONNECTIONS_PARAMS.SELECT_ID, store)
		},
		
		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) => "CONNECTIONS",
		getIcon: (_: void, store?: ViewStore) => srcIcon,
		getColorVar: (_: void, store?: ViewStore) => COLOR_VAR.GREEN,
		//#endregion
	},

	actions: {
		/** ho selezionato una connection quindi creo e visualizzo lo STACK del dettaglio */
		select(cnn: Connection, store?: CnnListStore) {
			const idSelPrev = store.getSelectId()
			// se è uguale a quello precedente allora deseleziona
			let idSel = (cnn && idSelPrev != cnn.id) ? cnn.id : null
			store.setSelectId(idSel)

			// eventualmente creo la nuova VIEW
			let srvStore:ViewStore = null
			if (idSel != null) srvStore = buildStore({
				type: DOC_TYPE.SERVICES,
			} as CnnDetailState)

			// aggiungo la nuova VIEW (o null)
			docsSo.addLink({
				view: srvStore,
				parent: store,
				anim: !idSelPrev || !idSel,
			})
		},
		/** creo un nuovo STORE DETTAGLIO CONNECTION
		 * e lo visualizzo nello STACK della lista CONNECTION */
		create(_: void, store?: CnnListStore) {
			store.setSelectId(null)
			const view = buildStore({
				type: DOC_TYPE.SERVICES,
			} as CnnDetailState)
			docsSo.addLink({ view, parent: store, anim: true })
		},
	},

	mutators: {
		setSelectId: (id: string, store?: CnnListStore) => {
			return docSetup.mutators.setParams({ [CONNECTIONS_PARAMS.SELECT_ID]: [id] }, store)
		},
	},
}

export type CnnListState = typeof setup.state & ViewState
export type CnnListGetters = typeof setup.getters
export type CnnListActions = typeof setup.actions
export type CnnListMutators = typeof setup.mutators
export interface CnnListStore extends ViewStore, StoreCore<CnnListState>, CnnListGetters, CnnListActions, CnnListMutators {
	state: CnnListState
}
const cnnSetup = mixStores(docSetup, setup)
export default cnnSetup


