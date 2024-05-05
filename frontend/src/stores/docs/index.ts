import { DOC_TYPE } from "@/stores/docs/types"
import { StoreCore, createStore } from "@priolo/jon"
import { CnnListStore } from "../stacks/connection"
import { ViewLogStore } from "../stacks/log"
import { AboutStore } from "../stacks/about"
import { ViewStore } from "../stacks/viewBase"
import { delay, delayAnim } from "@/utils/time"
import { HelpStore } from "../stacks/help"



export enum DRAWER_POSITION {
	RIGHT = "right",
	BOTTOM = "bottom",
}

export enum FIXED_CARD {
	CONNECTIONS = 0,
	LOGS = 1,
	ABOUT = 2,
}

/**
 * Gestisce la lista di DOCS presenti
 */
const setup = {

	state: {
		fixedViews: <[CnnListStore?, ViewLogStore?, AboutStore?]>null,
		zenCard: <ViewStore>null,
		zenOpen: false,
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
		zenOpen: async (card: ViewStore, store?: DocStore) => {
			if ( !card ) return
			store.setZenCard(card)
			await delayAnim()
			store.setZenOpen(true)
		},
		zenClose: async (_: void, store?: DocStore) => {
			store.setZenOpen(false)
			await delay(300)
			store.state.zenCard._update()
			store.setZenCard(null)

		}
	},

	mutators: {
		setFixedViews: (fixedViews: [CnnListStore, ViewLogStore, AboutStore, HelpStore]) => ({ fixedViews }),
		setZenCard: (zenCard: ViewStore) => ({ zenCard }),
		setZenOpen: (zenOpen: boolean) => ({ zenOpen }),
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
