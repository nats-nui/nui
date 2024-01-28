import srcIcon from "@/assets/StreamsIcon.svg"
import { COLOR_VAR } from "@/stores/layout"
import viewSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { StreamConsumer } from "@/types/Consumer"
import { StoreCore, mixStores } from "@priolo/jon"



/** STREAM DETAIL */
const setup = {

	state: {
		/** la CONNECTION che contiene lo STREAM */
		connectionId: <string>null,
		/** il nome dello STREAM che contiene questo CONSUMER */
		streamName: <string>null,
		/** il consumer appunto */
		consumer: <StreamConsumer>null,

		//#region VIEWBASE
		width: 230,
		colorVar: COLOR_VAR.FUCHSIA,
		//#endregion
	},

	getters: {
		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) => (<ConsumerStore>store).state.consumer?.config.name ?? "--",
		getSubTitle: (_: void, store?: ViewStore) => "CONSUMER DETAIL",
		getIcon: (_: void, store?: ViewStore) => srcIcon,
		getSerialization: (_: void, store?: ViewStore) => {
			const state = store.state as ConsumerState
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

		/** carico tutti i dati del CONSUMER se ce ne fosse bisogno */
		fetch: async (_: void, store?: ConsumerStore) => {
			// verifico che ci siano i dati del dettaglio
			// TO DO
		},
	},

	mutators: {
		setConsumer: (consumer: StreamConsumer) => ({ consumer }),
	},
}

export type ConsumerState = typeof setup.state & ViewState
export type ConsumerGetters = typeof setup.getters
export type ConsumerActions = typeof setup.actions
export type ConsumerMutators = typeof setup.mutators
export interface ConsumerStore extends ViewStore, StoreCore<ConsumerState>, ConsumerGetters, ConsumerActions, ConsumerMutators {
	state: ConsumerState
}
const consumerSetup = mixStores(viewSetup, setup)
export default consumerSetup
