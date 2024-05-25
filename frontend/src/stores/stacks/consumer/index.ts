import conApi from "@/api/consumers"
import cnnSo from "@/stores/connections"
import { COLOR_VAR } from "@/stores/layout"
import viewSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { ConsumerConfig, StreamConsumer } from "@/types/Consumer"
import { StoreCore, mixStores } from "@priolo/jon"
import loadBaseSetup, { LoadBaseState, LoadBaseStore } from "../loadBase"
import { buildConsumer, buildConsumerNew } from "./utils/factory"
import { findAll } from "../../docs/utils/manage"
import { GetAllCards } from "../../docs/cards"
import { DOC_TYPE } from "../../docs/types"
import { MESSAGE_TYPE } from "../../log/utils"



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

		/** open CREATION CARD */
		create(_: void, store?: ConsumersStore) {
			const view = buildConsumerNew(store.state.connectionId, store.state.streamName)
			store.state.group.addLink({ view, parent: store, anim: true })
			store.setSelect(null)
		},
		/** elimina lo sTREAM selezionato "state.select" */
		async delete(_: void, store?: ConsumersStore) {
			if (!await store.alertOpen({
				title: "CONSUMER DELETION",
				body: "This action is irreversible.\nAre you sure you want to delete the CONSUMER?",
			})) return

			const consumerName = store.state.select
			await conApi.remove(store.state.connectionId, store.state.streamName, consumerName, { store })
			store.setAll(store.state.all.filter(s => s.config.name != consumerName))
			store.setSelect(null)

			// cerco eventuali CARD di questo stream e lo chiudo
			const cardStreams = findAll(GetAllCards(), {
				type: DOC_TYPE.CONSUMER,
				connectionId: store.state.connectionId,
				streamName: store.state.streamName
			})
			cardStreams.forEach(view => view.state.group.remove({ view, anim: true }))

			store.setSnackbar({
				open: true, type: MESSAGE_TYPE.SUCCESS, timeout: 5000,
				title: "DELETED",
				body: "it is gone forever",
			})
		},

		update(streamConsumer: StreamConsumer, store?: ConsumersStore) {
			const all = [...store.state.all]
			const index = store.getIndexByName(streamConsumer?.name)
			index == -1 ? all.push(streamConsumer) : (all[index] = { ...all[index], ...streamConsumer })
			store.setAll(all)
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
