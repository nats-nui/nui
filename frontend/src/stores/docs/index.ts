import { DOC_TYPE } from "@/stores/docs/types"
import { StoreCore, createStore } from "@priolo/jon"
import { CnnListStore } from "../stacks/connection"
import { ViewLogStore } from "../stacks/log"



/**
 * Gestisce la lista di DOCS presenti
 */
const setup = {

	state: {
		
		/** CARD delle CONNECTIONS */
		connView: <CnnListStore>null,
		/** CARD dei LOGS */
		logsView: <ViewLogStore>null,

		cardOptions: <{ [type: string]: DOC_TYPE }>{},
	},

	getters: {
	},

	actions: {
		// focus(view: ViewStore, store?: DocStore) {
		// 	const elm = document.getElementById(view?.state?.uuid)
		// 	elm?.scrollIntoView({ behavior: "smooth", inline: "center" })
		// 	store.setFocus(view)
		// },
	},

	mutators: {
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
