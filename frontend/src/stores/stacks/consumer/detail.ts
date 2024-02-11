import srcIcon from "@/assets/StreamsIcon.svg"
import { COLOR_VAR } from "@/stores/layout"
import viewSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { StreamConsumer } from "@/types/Consumer"
import { StoreCore, mixStores } from "@priolo/jon"
import { ConsumersState, ConsumersStore } from "."
import docSo from "@/stores/docs"
import { DOC_TYPE } from "@/types"
import cnsApi from "@/api/consumers"



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
				connectionId: state.connectionId,
				streamName: state.streamName,
				consumer: state.consumer,
			}
		},
		//#endregion

		getParentList: (_: void, store?: ConsumerStore): ConsumersStore => docSo.find({
			type: DOC_TYPE.CONSUMERS,
			connectionId: store.state.connectionId,
			streamName: store.state.streamName,
		} as Partial<ConsumersState>) as ConsumersStore,
	},

	actions: {
		//#region VIEWBASE
		setSerialization: (data: any, store?: ViewStore) => {
			viewSetup.actions.setSerialization(data, store)
			const state = store.state as ConsumerState
			state.connectionId = data.connectionId
			state.streamName = data.streamName
			state.consumer = data.consumer
		},
		//#endregion


		
		async fetchIfVoid(_: void, store?: ConsumerStore) {
			if (!!store.state.consumer) return
			await store.fetch()
		},
		fetch: async (_: void, store?: ConsumerStore) => {
			const consumer = await cnsApi.get(store.state.connectionId, store.state.streamName, store.state.consumer.name)
			store.setConsumer(consumer)
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
