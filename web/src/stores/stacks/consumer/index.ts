import srcIcon from "@/assets/StreamsIcon.svg"
import cnnSo from "@/stores/connections"
import { COLOR_VAR } from "@/stores/layout"
import docSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { StreamConsumer } from "@/types/Consumer"
import { StoreCore, mixStores } from "@priolo/jon"
import conApi from "@/api/consumers"
import { buildStore } from "@/stores/docs/utils/factory"
import { DOC_TYPE } from "@/types"
import docSo from "@/stores/docs"
import { ConsumerState } from "./detail"



/** CONSUMERS COLLECTION */
const setup = {

	state: {
		/** connection */
		connectionId: <string>null,
		/** nome dello stream di riferimento */
		streamName: <string>null,

		/** nome del CONSUMER selezionato */
		select: <string>null,
		all: <StreamConsumer[]>[],

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
		//#endregion

		getByName(name: string, store?: ConsumersStore) {
			if (!name) return null
			return store.state.all?.find(c => c.config.name == name)
		},
	},

	actions: {
		async fetch(_: void, store?: ConsumersStore) {
			const consumers = await conApi.index(store.state.connectionId, store.state.streamName)
			store.setAll(consumers)
		},
		/** visualizzo dettaglio di uno STREAM */
		select(name: string, store?: ConsumersStore) {
			const nameOld = store.state.select
			// se è uguale a quello precedente allora deseleziona
			let nameNew = (name && nameOld != name) ? name : null
			store.setSelect(nameNew)

			// eventualmente creo la nuova VIEW
			let consumerStore:ViewStore = null
			if (nameNew != null) consumerStore = buildStore({
				type: DOC_TYPE.CONSUMER,
				connectionId: store.state.connectionId,
				streamName: store.state.streamName,
				consumer: store.getByName(nameNew),
			} as ConsumerState)

			// aggiungo la nuova VIEW (o null)
			docSo.addLink({
				view: consumerStore,
				parent: store,
				anim: !nameOld || !nameNew,
			})
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
const consumersSetup = mixStores(docSetup, setup)
export default consumersSetup
