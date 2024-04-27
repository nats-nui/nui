import conApi from "@/api/consumers"
import cnnSo from "@/stores/connections"
import { COLOR_VAR } from "@/stores/layout"
import viewSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { StreamConsumer } from "@/types/Consumer"
import { StoreCore, mixStores } from "@priolo/jon"
import loadBaseSetup, { LoadBaseState, LoadBaseStore } from "../loadBase"
import { buildConsumer } from "./utils/factory"



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
		textSearch: <string>null,

		//#region VIEWBASE
		width: 310,
		widthMax: 800,
		colorVar: COLOR_VAR.FUCHSIA,
		//#endregion
	},

	getters: {
		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) => "CONSUMERS",
		getSubTitle: (_: void, store?: ViewStore) => cnnSo.getById((<ConsumersStore>store).state.connectionId)?.name ?? "--",
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
			return store.state.all?.find(c => c.name == name)
		},
		getIndexByName(name: string, store?: ConsumersStore) {
			if (!name) return -1
			return store.state.all?.findIndex(c => c.name == name)
		},
		/** filtrati e da visualizzare in lista */
		getFiltered(_: void, store?: ConsumersStore) {
			const text = store.state.textSearch?.toLocaleLowerCase()?.trim()
			if (!text || text.trim().length == 0 || !store.state.all) return store.state.all
			return store.state.all.filter(consumer =>
				consumer.name.toLowerCase().includes(text)
			)
		}
	},

	actions: {

		//#region OVERWRITE
		setSerialization: (data: any, store?: ViewStore) => {
			viewSetup.actions.setSerialization(data, store)
			const state = store.state as ConsumersState
			state.connectionId = data.connectionId
			state.streamName = data.streamName
		},
		async fetch(_: void, store?: LoadBaseStore) {
			const s = <ConsumersStore>store
			const consumers = await conApi.index(s.state.connectionId, s.state.streamName, { store, manageAbort: true })
			s.setAll(consumers)
			await loadBaseSetup.actions.fetch(_, store)
		},
		//#endregion

		async fetchIfVoid(_: void, store?: ConsumersStore) {
			if (!!store.state.all) return
			await store.fetch()
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
			store.state.group.addLink({ view, parent: store, anim: !nameOld || !nameNew })
		},
	},

	mutators: {
		setAll: (all: StreamConsumer[]) => ({ all }),
		setSelect: (select: string) => ({ select }),
		setTextSearch: (textSearch: string) => ({ textSearch }),
	},
}

export type ConsumersState = typeof setup.state & ViewState & LoadBaseState
export type ConsumersGetters = typeof setup.getters
export type ConsumersActions = typeof setup.actions
export type ConsumersMutators = typeof setup.mutators
export interface ConsumersStore extends ViewStore, LoadBaseStore, StoreCore<ConsumersState>, ConsumersGetters, ConsumersActions, ConsumersMutators {
	state: ConsumersState
}
const consumersSetup = mixStores(viewSetup, loadBaseSetup, setup)
export default consumersSetup
