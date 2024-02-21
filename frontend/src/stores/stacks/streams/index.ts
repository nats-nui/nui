import strApi from "@/api/streams"
import srcIcon from "@/assets/StreamsIcon.svg"
import cnnSo from "@/stores/connections"
import docSo from "@/stores/docs"
import { buildConsumers } from "../consumer/utils/factory"
import { buildStream, buildStreamMessages, buildStreamNew } from "./utils/factory"
import { COLOR_VAR } from "@/stores/layout"
import { ViewState, ViewStore, default as docSetup, default as viewSetup } from "@/stores/stacks/viewBase"
import { StreamInfo } from "@/types/Stream"
import { StoreCore, mixStores } from "@priolo/jon"



/** STREAMS COLLECTION */
const setup = {

	state: {
		connectionId: <string>null,
		/** nome dello STREAM selezionato */
		select: <string>null,
		all: <StreamInfo[]>null,

		//#region VIEWBASE
		width: 310,
		colorVar: COLOR_VAR.YELLOW,
		//#endregion
	},

	getters: {

		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) => cnnSo.getById((<StreamsStore>store).state.connectionId)?.name,
		getSubTitle: (_: void, store?: ViewStore) => "STREAMS",
		getIcon: (_: void, store?: ViewStore) => srcIcon,
		getSerialization: (_: void, store?: ViewStore) => {
			const state = store.state as StreamsState
			return {
				...viewSetup.getters.getSerialization(null, store),
				connectionId: state.connectionId,
				select: state.select,
			}
		},
		//#endregion

		getByName(name: string, store?: StreamsStore) {
			if (!name) return null
			return store.state.all?.find(s => s.config.name == name)
		},
		getIndexByName(name: string, store?: StreamsStore) {
			if (!name) return -1
			return store.state.all?.findIndex(s => s.config.name == name)
		},
		getAllStreamName(_: void, store?: StreamsStore) {
			return store.state.all?.map(si => si.config.name) ?? []
		}
	},

	actions: {

		//#region VIEWBASE
		setSerialization: (data: any, store?: ViewStore) => {
			viewSetup.actions.setSerialization(data, store)
			const state = store.state as StreamsState
			state.connectionId = data.connectionId
			state.select = data.select
		},
		//#endregion

		async fetchIfVoid(_: void, store?: StreamsStore) {
			if (!!store.state.all) return
			await store.fetch()
		},
		async fetch(_: void, store?: StreamsStore) {
			const streams = await strApi.index(store.state.connectionId, { store })
			store.setAll(streams)
		},
		/** open CREATION CARD */
		create(_: void, store?: StreamsStore) {
			const view = buildStreamNew(store.state.connectionId, store.getAllStreamName())
			docSo.addLink({ view, parent: store, anim: true })
			store.setSelect(null)
		},
		async delete(_: void, store?: StreamsStore) {
			const name = store.state.select
			await strApi.remove(store.state.connectionId, name, { store })
			store.setAll(store.state.all.filter(s => s.config.name != name))
			store.setSelect(null)
		},



		update(stream: StreamInfo, store?: StreamsStore) {
			const all = [...store.state.all]
			const index = store.getIndexByName(stream.config?.name)
			index == -1 ? all.push(stream) : (all[index] = { ...all[index], ...stream })
			store.setAll(all)
		},
		/** visualizzo dettaglio di uno STREAM */
		select(name: string, store?: StreamsStore) {
			const nameOld = store.state.select
			const nameNew = (name && nameOld !== name) ? name : null
			const view = nameNew
				? buildStream(store.state.connectionId, store.getByName(nameNew), store.getAllStreamName())
				: null
			store.setSelect(nameNew)
			docSo.addLink({ view, parent: store, anim: !nameOld || !nameNew })
		},



		/** apertura della CARD CONSUMERS */
		openConsumers(streamName: string, store?: StreamsStore) {
			docSo.addLink({
				view: buildConsumers(store.state.connectionId, store.getByName(streamName)),
				parent: store,
				anim: true
			})
		},
		/** apertura della CARD MESSAGES */
		openMessages(streamName: string, store?: StreamsStore) {
			docSo.addLink({
				view: buildStreamMessages(store.state.connectionId, store.getByName(streamName)),
				parent: store,
				anim: true
			})
		},
	},

	mutators: {
		setAll: (all: StreamInfo[]) => ({ all }),
		setSelect: (select: string) => ({ select }),
	},
}

export type StreamsState = typeof setup.state & ViewState
export type StreamsGetters = typeof setup.getters
export type StreamsActions = typeof setup.actions
export type StreamsMutators = typeof setup.mutators
export interface StreamsStore extends ViewStore, StoreCore<StreamsState>, StreamsGetters, StreamsActions, StreamsMutators {
	state: StreamsState
}
const streamsSetup = mixStores(docSetup, setup)
export default streamsSetup
