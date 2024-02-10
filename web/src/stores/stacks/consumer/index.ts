import conApi from "@/api/consumers"
import srcIcon from "@/assets/StreamsIcon.svg"
import cnnSo from "@/stores/connections"
import docSo from "@/stores/docs"
import { buildConsumer } from "@/stores/docs/utils/factory"
import { COLOR_VAR } from "@/stores/layout"
import viewSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { StreamConsumer } from "@/types/Consumer"
import { StoreCore, mixStores } from "@priolo/jon"



/** CONSUMERS COLLECTION */
const setup = {

	state: {
		/** connection */
		connectionId: <string>null,
		/** nome dello stream di riferimento */
		streamName: <string>null,

		/** nome del CONSUMER selezionato */
		select: <string>null,
		all: <StreamConsumer[]>null,

		//#region VIEWBASE
		width: 200,
		colorVar: COLOR_VAR.FUCHSIA,
		//#endregion
	},

	getters: {
		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) => cnnSo.getById((<ConsumersStore>store).state.connectionId)?.name,
		getSubTitle: (_: void, store?: ViewStore) => "CONSUMERS",
		getIcon: (_: void, store?: ViewStore) => srcIcon,
		getSerialization: (_: void, store?: ViewStore) => {
			const state = store.state as ConsumersState
			return {
				...viewSetup.getters.getSerialization(null, store),
				connectionId: state.connectionId,
				streamName: state.streamName,
				select: state.select,
			}
		},
		//#endregion

		getByName(name: string, store?: ConsumersStore) {
			if (!name) return null
			return store.state.all?.find(c => c.config.name == name)
		},
		getIndexByName(name: string, store?: ConsumersStore) {
			if (!name) return -1
			return store.state.all?.findIndex(c => c.name == name)
		},
	},

	actions: {

		//#region VIEWBASE
		setSerialization: (data: any, store?: ViewStore) => {
			viewSetup.actions.setSerialization(data, store)
			const state = store.state as ConsumersState
			state.connectionId = data.connectionId
			state.streamName = data.streamName
		},
		//#endregion



		async fetchIfVoid(_: void, store?: ConsumersStore) {
			if (!!store.state.all) return
			await store.fetch()
		},
		async fetch(_: void, store?: ConsumersStore) {
			const consumers = await conApi.index(store.state.connectionId, store.state.streamName)
			store.setAll(consumers)
		},


		
		/** apro la CARD del dettaglio */
		select(name: string, store?: ConsumersStore) {
			const nameOld = store.state.select
			const nameNew = (name && nameOld !== name) ? name : null
			const view = nameNew ? buildConsumer(
				store.state.connectionId,
				store.state.streamName,
				store.getByName(nameNew)
			) : null
			store.setSelect(nameNew)
			docSo.addLink({ view, parent: store, anim: !nameOld || !nameNew })
		},
	},

	mutators: {
		setAll: (all: StreamConsumer[]) => ({ all }),
		setSelect: (select: string) => ({ select }),
	},
}

export type ConsumersState = typeof setup.state & ViewState
export type ConsumersGetters = typeof setup.getters
export type ConsumersActions = typeof setup.actions
export type ConsumersMutators = typeof setup.mutators
export interface ConsumersStore extends ViewStore, StoreCore<ConsumersState>, ConsumersGetters, ConsumersActions, ConsumersMutators {
	state: ConsumersState
}
const consumersSetup = mixStores(viewSetup, setup)
export default consumersSetup
