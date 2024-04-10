import { DOC_TYPE } from "@/stores/docs/types"
import { StoreCore, createStore } from "@priolo/jon"
import { CnnListStore } from "../stacks/connection"
import { ViewLogStore } from "../stacks/log"



/**
 * Gestisce la lista di DOCS presenti
 */
const setup = {

	state: {
		fixedViews: <[CnnListStore?, ViewLogStore?]>null,
		cardOptions: <{ [type: string]: DOC_TYPE }>{},
	},

	getters: {
	},

	actions: {
	},

	mutators: {
		setFixedViews: (fixedViews: [CnnListStore, ViewLogStore]) => ({ fixedViews }),
	},
}

export type DocState = typeof setup.state
export type DocGetters = typeof setup.getters
export type DocActions = typeof setup.actions
export type DocMutators = typeof setup.mutators
export interface DocStore extends StoreCore<DocState>, DocGetters, DocActions, DocMutators {
	state: DocState
}
const docsSo = createStore(setup) as DocStore

export default docsSo
