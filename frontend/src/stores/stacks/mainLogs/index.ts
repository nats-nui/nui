import srcIcon from "@/assets/MessagesIcon.svg"
import { COLOR_VAR } from "@/stores/layout"
import viewSetup, { ViewStore } from "@/stores/stacks/viewBase"
import { StoreCore, mixStores } from "@priolo/jon"
import { ViewState } from "../viewBase"
import { Log } from "./utils"



const setup = {

	state: {
		history: <Log[]>[],

		//#region VIEWBASE
		colorVar: COLOR_VAR.CYAN,
		//#endregion
	},

	getters: {
		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) => "LOGS",
		getSubTitle: (_: void, store?: ViewStore) => "MESSAGES",
		getIcon: (_: void, store?: ViewStore) => srcIcon,
		getSerialization: (_: void, store?: ViewStore) => {
			const state = store.state as LogsState
			return {
				...viewSetup.getters.getSerialization(null, store),
			}
		},
		//#endregion

	},

	actions: {

		//#region VIEWBASE
		setSerialization: (data: any, store?: ViewStore) => {
			viewSetup.actions.setSerialization(data, store)
		},
		//#endregion

	},

	mutators: {
		setHistory: (history: Log[]) => ({ history }),
	},
}

export type LogsState = typeof setup.state & ViewState
export type LogsGetters = typeof setup.getters
export type LogsActions = typeof setup.actions
export type LogsMutators = typeof setup.mutators
export interface LogsStore extends ViewStore, StoreCore<LogsState>, LogsGetters, LogsActions, LogsMutators {
	state: LogsState
}
const msgSetup = mixStores(viewSetup, setup)
export default msgSetup


