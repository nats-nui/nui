import cnsApi from "@/api/consumers"
import { utils } from "@priolo/jack"
import viewSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { DOC_TYPE, EDIT_STATE } from "@/types"
import { ConsumerConfig, StreamConsumer } from "@/types/Consumer"
import { mixStores } from "@priolo/jon"
import { ConsumersState, ConsumersStore } from "."
import { buildStore } from "../../docs/utils/factory"
import { MESSAGE_TYPE } from "../../log/utils"
import { JsonConfigState, JsonConfigStore } from "../jsonconfig"
import loadBaseSetup, { LoadBaseState, LoadBaseStore } from "../loadBase"



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

		getParentList: (_: void, store?: ConsumerStore): ConsumersStore => utils.findInRoot(store.state.group.state.all, {
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


		/** apertura della CARD JSON CONFIG */
		openJsonConfig(_: void, store?: ConsumerStore) {
			// se è già aperta la chiudo
			const configOpen = store.state.linked?.state.type == DOC_TYPE.JSON_CONFIG
			if (configOpen) {
				store.state.group.addLink({ view: null, parent: store, anim: true })
				return
			}
			const configStore = buildStore({
				type: DOC_TYPE.JSON_CONFIG,
				value: JSON.stringify(store.state.consumer.config),
				title: `CONSUMER: ${store.state.consumer.config.name}`,
				onClose: (value: string) => {
					if (!value) return
					const config = JSON.parse(value) as ConsumerConfig
					store?.setConsumerConfig(config)
				},
			} as JsonConfigState) as JsonConfigStore;
			store.state.group.addLink({ view: configStore, parent: store, anim: true })
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
export interface ConsumerStore extends ViewStore, LoadBaseStore, ConsumerGetters, ConsumerActions, ConsumerMutators {
	state: ConsumerState
}
const consumerSetup = mixStores(viewSetup, loadBaseSetup, setup)
export default consumerSetup
