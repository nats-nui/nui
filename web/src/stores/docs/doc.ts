import { DOC_TYPE, POSITION_TYPE } from "@/types"
import { StoreCore } from "@priolo/jon"



export enum PARAMS_DOC {
	POSITION = "pos",
}

const setup = {

	state: {
		uuid: <string>null,
		type: DOC_TYPE.EMPTY,
		params: <{ [name: string]: any[] }>{},
		position: POSITION_TYPE.DETACHED,
		parent: <ViewStore>null,
		linked: <ViewStore>null,
		stacked: <ViewStore[]>[],
	},

	getters: {
		getParam(name: string, store?: ViewStore) {
			return store.state.params?.[name]?.[0]
		},
	},

	actions: {
	},

	mutators: {
		setParams(ps: { [name: string]: any }, store?: ViewStore) {
			const params = { ...store.state.params, ...ps }
			return { params }
		}
	},
}

export type ViewState = Partial<typeof setup.state>
export type ViewGetters = typeof setup.getters
export type ViewActions = typeof setup.actions
export type ViewMutators = typeof setup.mutators
export interface ViewStore extends StoreCore<ViewState>, ViewGetters, ViewActions, ViewMutators {
	state: ViewState
}

export default setup

