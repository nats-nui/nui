import docsSo from "@/stores/docs"
import { ViewState, ViewStore, default as docSetup } from "@/stores/docs/viewBase"
import { DOC_ANIM, DOC_TYPE } from "@/types"
import { Connection } from "@/types/Connection"
import { StoreCore, mixStores } from "@priolo/jon"
import { buildStore } from "../../docs/utils/factory"
import { CnnDetailState } from "./detail"



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
		/** OVERWRITING */
		width: 250,
	},

	getters: {
		/** l'id della CONNECTION attualmente selezionata */
		getSelectId(_: void, store?: CnnListStore): string {
			return docSetup.getters.getParam(CONNECTIONS_PARAMS.SELECT_ID, store)
		},
	},

	actions: {
		/** ho selezionato una connection quindi creo e visualizzo lo STACK del dettaglio */
		select(cnn: Connection, store?: CnnListStore) {
			const idSelPrev = store.getSelectId()
			let idSel = idSelPrev != cnn.id ? cnn.id : null
			store.setSelectId(idSel)
			let srvStore = null
			if (idSel != null) srvStore = buildStore({
				type: DOC_TYPE.SERVICES,
				connection: cnn,
			} as CnnDetailState)
			docsSo.addLink({
				view: srvStore,
				parent: store,
			})
		},
		/** ho creato una nuova connection quindi creo e visualizzo lo STACK del dettaglio */
		create(_: void, store?: CnnListStore) {
			const view = buildStore({
				type: DOC_TYPE.SERVICES,
				connection: {
					name: "<new>",
					subscriptions: [],
				},
			} as CnnDetailState)
			docsSo.addLink({ view, parent: store })
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


