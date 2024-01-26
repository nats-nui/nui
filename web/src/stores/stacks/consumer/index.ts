import srcIcon from "@/assets/StreamsIcon.svg"
import cnnSo from "@/stores/connections"
import { COLOR_VAR } from "@/stores/layout"
import docSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { ConsumerInfo } from "@/types/Consumer"
import { StoreCore, mixStores } from "@priolo/jon"



/** CONSUMERS COLLECTION */
const setup = {

	state: {
		/** connection */
		connectionId: <string>null,
		/** nome dello stream di riferimento */
		streamName: <string>null,

		all: <ConsumerInfo[]>[],

		//#region VIEWBASE
		width: 200,
		//#endregion
	},

	getters: {
		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) => cnnSo.getById((<ConsumersStore>store).state.connectionId)?.name,
		getSubTitle: (_: void, store?: ViewStore) => "STREAMS",
		getIcon: (_: void, store?: ViewStore) => srcIcon,
		getColorVar: (_: void, store?: ViewStore) => COLOR_VAR.YELLOW,
		//#endregion
	},

	actions: {
	},

	mutators: {
		setAll: (all: ConsumerInfo[]) => ({ all }),
	},
}

export type ConsumersState = typeof setup.state & ViewState
export type ConsumersGetters = typeof setup.getters
export type ConsumersActions = typeof setup.actions
export type ConsumersMutators = typeof setup.mutators
export interface ConsumersStore extends ViewStore, StoreCore<ConsumersState>, ConsumersGetters, ConsumersActions, ConsumersMutators {
	state: ConsumersState
}
const consumersSetup = mixStores(docSetup, setup)
export default consumersSetup
