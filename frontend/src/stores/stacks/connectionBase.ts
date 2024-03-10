import { StoreCore } from "@priolo/jon"
import { ViewState, ViewStore } from "./viewBase"


/** DA FARE */
const connectionBaseSetup = {

	state: {
		connectionId: <string>null,
	},

	getters: {
	},

	actions: {
	},

	mutators: {
	},
}

export type ConnectionBaseState = Partial<typeof connectionBaseSetup.state> & ViewState
export type ConnectionBaseGetters = typeof connectionBaseSetup.getters
export type ConnectionBaseActions = typeof connectionBaseSetup.actions
export type ConnectionBaseMutators = typeof connectionBaseSetup.mutators
export interface ConnectionBaseStore extends ViewStore, StoreCore<ConnectionBaseState>, ConnectionBaseGetters, ConnectionBaseActions, ConnectionBaseMutators {
	state: ConnectionBaseState
}

export default connectionBaseSetup
