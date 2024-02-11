import { StoreCore, createStore } from "@priolo/jon"


const setup = {

	state: {
	},

	getters: {
	},

	actions: {
	},

	mutators: {
	},
}

export type AuthState = typeof setup.state
export type AuthGetters = typeof setup.getters
export type AuthActions = typeof setup.actions
export type AuthMutators = typeof setup.mutators
export interface AuthStore extends StoreCore<AuthState>, AuthGetters, AuthActions, AuthMutators {
	state: AuthState
}
const store = createStore(setup) as AuthStore
export default store
