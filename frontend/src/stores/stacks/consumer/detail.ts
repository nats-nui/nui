import cnsApi from "@/api/consumers"
import { COLOR_VAR } from "@/stores/layout"
import viewSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { DOC_TYPE, EDIT_STATE } from "@/types"
import { ConsumerConfig, StreamConsumer } from "@/types/Consumer"
import { StoreCore, mixStores } from "@priolo/jon"
import { ConsumersState, ConsumersStore } from "."
import loadBaseSetup, { LoadBaseState, LoadBaseStore } from "../loadBase"
import { findInRoot } from "@/stores/docs/utils/manage"
import { MESSAGE_TYPE } from "../../log/utils"



/** STREAM DETAIL */
const setup = {

	state: {
		/** la CONNECTION che contiene lo STREAM */
		connectionId: <string>null,
		/** il nome dello STREAM che contiene questo CONSUMER */
		streamName: <string>null,
		/** il consumer appunto */
		consumer: <StreamConsumer>null,

		editState: EDIT_STATE.READ,

		//#region VIEWBASE
		width: 230,
		colorVar: COLOR_VAR.FUCHSIA,
		//#endregion
	},

	getters: {
		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) => "CONSUMER DETAIL",
		getSubTitle: (_: void, store?: ViewStore) => (<ConsumerStore>store).state.consumer?.config?.name ?? "--",
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

		getParentList: (_: void, store?: ConsumerStore): ConsumersStore => findInRoot(store.state.group.state.all, {
			type: DOC_TYPE.CONSUMERS,
			connectionId: store.state.connectionId,
			streamName: store.state.streamName,
		} as Partial<ConsumersState>) as ConsumersStore,
	},

	actions: {

		//#region OVERWRITE

		setSerialization: (data: any, store?: ViewStore) => {
			viewSetup.actions.setSerialization(data, store)
			const state = store.state as ConsumerState
			state.connectionId = data.connectionId
			state.streamName = data.streamName
			state.consumer = data.consumer
		},

		fetch: async (_: void, store?: LoadBaseStore) => {
			const s = <ConsumerStore>store
			const consumer = await cnsApi.get(s.state.connectionId, s.state.streamName, s.state.consumer.name, { store, manageAbort: true })
			s.setConsumer(consumer)
			await loadBaseSetup.actions.fetch(_, store)
		},

		//#endregion



		async fetchIfVoid(_: void, store?: ConsumerStore) {
			if (!!store.state.consumer) return
			await store.fetch()
		},

		/** crea un nuovo CONSUMER-INFO tramite CONSUMER-CONFIG */
		async save(_: void, store?: ConsumerStore) {
			let consumerSaved: StreamConsumer = null
			if (store.state.editState == EDIT_STATE.NEW) {
				consumerSaved = await cnsApi.create(store.state.connectionId, store.state.streamName, store.state.consumer.config, { store })
			} else {
				consumerSaved = await cnsApi.update(store.state.connectionId, store.state.streamName, store.state.consumer.config.name,  store.state.consumer.config, { store })
			}
			store.setConsumer(consumerSaved)
			store.getParentList()?.update(consumerSaved)
			store.getParentList()?.setSelect(consumerSaved.config.name)
			store.setEditState(EDIT_STATE.READ)
			store.setSnackbar({
				open: true, type: MESSAGE_TYPE.SUCCESS, timeout: 5000,
				title: "SAVED",
				body: "you can find it in the CONSUMERS list",
			})
		},
		/** reset ENTITY */
		restore: (_: void, store?: ConsumerStore) => {
			store.fetch()
			store.setEditState(EDIT_STATE.READ)
		},

	},

	mutators: {
		setConsumer: (consumer: StreamConsumer) => ({ consumer }),
		setEditState: (editState: EDIT_STATE) => ({ editState }),
		setConsumerConfig: (config: ConsumerConfig, store?: ConsumerStore) => ({ consumer: { ...store.state.consumer, config } }),
	},
}

export type ConsumerState = typeof setup.state & ViewState & LoadBaseState
export type ConsumerGetters = typeof setup.getters
export type ConsumerActions = typeof setup.actions
export type ConsumerMutators = typeof setup.mutators
export interface ConsumerStore extends ViewStore, LoadBaseStore, StoreCore<ConsumerState>, ConsumerGetters, ConsumerActions, ConsumerMutators {
	state: ConsumerState
}
const consumerSetup = mixStores(viewSetup, loadBaseSetup, setup)
export default consumerSetup
