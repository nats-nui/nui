import { StoreCore } from "@priolo/jon"
import { LOAD_MODE, LOAD_STATE } from "./utils"
import { ViewState, ViewStore } from "./viewBase"


/** DA FARE  */
const loadBaseSetup = {

	state: {
		loadingMode: LOAD_MODE.MANUAL,
		loadingState: LOAD_STATE.IDLE,
		pollingTime: 0,
		fetchAbort: <AbortController>null,
	},

	getters: {
	},

	actions: {
		/** esegue un aggiornamento della CARD */
		fetch: async (_: void, store?: LoadBaseStore) => {
			const linkCard = store.state.linked as LoadBaseStore
			if (linkCard?.state.loadingMode == LOAD_MODE.PARENT) linkCard.fetch()
		},
		fetchAbort: (_: void, store?: LoadBaseStore) => {
			store.state.fetchAbort?.abort()
		},
	},

	mutators: {
		setLoadingState: (loadingState: LOAD_STATE) => ({ loadingState }),
		setLoadingMode: (loadingMode: LOAD_MODE) => ({ loadingMode }),
		setPollingTime: (pollingTime: number) => ({ pollingTime })
	},
}

export type LoadBaseState = Partial<typeof loadBaseSetup.state> & ViewState
export type LoadBaseGetters = typeof loadBaseSetup.getters
export type LoadBaseActions = typeof loadBaseSetup.actions
export type LoadBaseMutators = typeof loadBaseSetup.mutators
export interface LoadBaseStore extends ViewStore, StoreCore<LoadBaseState>, LoadBaseGetters, LoadBaseActions, LoadBaseMutators {
	state: LoadBaseState
}

export default loadBaseSetup
