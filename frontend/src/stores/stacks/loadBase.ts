import { EditorRefProps } from "@/components/editor"
import { MSG_FORMAT } from "@/utils/editor"
import { StoreCore } from "@priolo/jon"
import { ViewState, ViewStore } from "./viewBase"
import { LOAD_MODE, LOAD_STATE } from "./utils"


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
		fetch: async (_: void, store?: LoadBaseStore) => {
			// VIRTUAL
		},
		fetchAbort:(_: void, store?: LoadBaseStore) => {
			store.state.fetchAbort.abort()
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
