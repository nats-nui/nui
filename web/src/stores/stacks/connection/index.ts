import docsSo from "@/stores/docs"
import { ViewState, ViewStore, default as docSetup, default as superDoc } from "@/stores/docs/docBase"
import { DOC_TYPE } from "@/types"
import { Connection } from "@/types/Connection"
import { StoreCore, mixStores } from "@priolo/jon"
import { initView } from "../../docs/utils/factory"



export enum CONNECTIONS_PARAMS {
	SELECT = "slc"
}

const setup = {

	state: {
		params: {
			[CONNECTIONS_PARAMS.SELECT]: <string[]>null
		}
	},

	getters: {
		getSelectId(_: void, store?: CnnViewStore) {
			return superDoc.getters.getParam(CONNECTIONS_PARAMS.SELECT, store)
		},
	},

	actions: {
		select(cnn: Connection, store?: CnnViewStore) {
			const idSelPrev = store.getSelectId()
			let idSel = idSelPrev != cnn.id ? cnn.id : null
			store.setSelectId(idSel)
			let srvStore = null
			if ( idSel != null ) srvStore = initView({
				uuid: cnn.id,
				type: DOC_TYPE.SERVICES,
			})
			docsSo.addLink({
				view: srvStore,
				parent: store,
			})
		},
	},

	mutators: {
		setSelectId: (id: string, store?: CnnViewStore) => {
			return superDoc.mutators.setParams({ [CONNECTIONS_PARAMS.SELECT]: [id] }, store)
		},
	},
}

export type CnnViewState = typeof setup.state & ViewState
export type CnnViewGetters = typeof setup.getters
export type CnnViewActions = typeof setup.actions
export type CnnViewMutators = typeof setup.mutators
export interface CnnViewStore extends ViewStore, StoreCore<CnnViewState>, CnnViewGetters, CnnViewActions, CnnViewMutators {
	state: CnnViewState
}
const cnnSetup = mixStores(docSetup, setup)
export default cnnSetup


