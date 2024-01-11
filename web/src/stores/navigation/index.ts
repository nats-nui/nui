import { StoreCore, createStore } from "@priolo/jon"
import { setParams } from "./utils"



const setup = {

	state: {
		query: "",
	},

	getters: {
		getSearchUrl: (names: string | string[], store?: NavigationStore) => {
			const searchParams = new URLSearchParams(store.state.query)
			if (typeof names == "string") return searchParams.get(names)
			if (!names) return []
			return names.map(name => searchParams.get(name))
		},
	},

	actions: {
		setParams( params:string[], store?:NavigationStore) {
			const result = setParams(params, store.state.query)
			setTimeout(() => window.history.replaceState(null, null, "?" + result), 100)
			store.setQuery(result)
		}
	},

	mutators: {
		setQuery: (query: string) => ({ query }),
	},
}

export type NavigationState = typeof setup.state
export type NavigationGetters = typeof setup.getters
export type NavigationActions = typeof setup.actions
export type NavigationMutators = typeof setup.mutators
export interface NavigationStore extends StoreCore<NavigationState>, NavigationGetters, NavigationActions, NavigationMutators {
	state: NavigationState
}
const store = createStore(setup) as NavigationStore
export default store

