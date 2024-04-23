import { DOC_TYPE } from "@/stores/docs/types"
import { StoreCore, createStore } from "@priolo/jon"
import { CnnListStore } from "../stacks/connection"
import { ViewLogStore } from "../stacks/log"
import { AboutStore } from "../stacks/about"



export enum DRAWER_POSITION {
	RIGHT="right",
	BOTTOM="bottom",
}

/**
 * Gestisce la lista di DOCS presenti
 */
const setup = {

	state: {
		fixedViews: <[CnnListStore?, ViewLogStore?, AboutStore?]>null,
		cardOptions: <{ [type: string]: DOC_TYPE }>{},
		drawerPosition: DRAWER_POSITION.RIGHT,
	},

	getters: {
		getSerialization: (_: void, store?: DocStore) => {
			return {
				drawerPosition: store.state.drawerPosition,
			}
		}
	},

	actions: {
		setSerialization: (state: any, store?: DocStore) => {
			store.state.drawerPosition = state.drawerPosition
		},
	},

	mutators: {
		setFixedViews: (fixedViews: [CnnListStore, ViewLogStore, AboutStore]) => ({ fixedViews }),
		setDrawerPosition: (drawerPosition: DRAWER_POSITION) => ({ drawerPosition }),
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
