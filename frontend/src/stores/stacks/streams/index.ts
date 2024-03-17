import strApi from "@/api/streams"
import cnnSo from "@/stores/connections"
import docSo from "@/stores/docs"
import { COLOR_VAR } from "@/stores/layout"
import { ViewState, ViewStore, default as docSetup, default as viewSetup } from "@/stores/stacks/viewBase"
import { DOC_TYPE } from "@/types"
import { StreamInfo } from "@/types/Stream"
import { StoreCore, mixStores } from "@priolo/jon"
import { buildConsumers } from "../consumer/utils/factory"
import loadBaseSetup, { LoadBaseState, LoadBaseStore } from "../loadBase"
import { buildStream, buildStreamMessages, buildStreamNew } from "./utils/factory"



/** STREAMS COLLECTION */
const setup = {

	state: {
		connectionId: <string>null,
		/** nome dello STREAM selezionato */
		select: <string>null,
		all: <StreamInfo[]>null,
		textSearch: <string>null,

		purgeOpen: false,

		//#region VIEWBASE
		width: 310,
		colorVar: COLOR_VAR.YELLOW,
		//#endregion
	},

	getters: {

		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) => "STREAMS",
		getSubTitle: (_: void, store?: ViewStore) => cnnSo.getById((<StreamsStore>store).state.connectionId)?.name ?? "--",
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
		},

		/** gli STREAM filtrati e da visualizzare in lista */
		getFiltered(_: void, store?: StreamsStore) {
			if (!store.state.all) return null
			const text = store.state.textSearch?.toLocaleLowerCase()
			if (!text || text.trim().length == 0) return store.state.all
			return store.state.all.filter(stream =>
				stream.config.name.toLowerCase().includes(text)
			)
		}
	},

	actions: {

		//#region OVERWRITE
		setSerialization: (data: any, store?: ViewStore) => {
			viewSetup.actions.setSerialization(data, store)
			const state = store.state as StreamsState
			state.connectionId = data.connectionId
			state.select = data.select
		},
		async fetch(_: void, store?: LoadBaseStore) {
			const s = <StreamsStore>store
			const streams = await strApi.index(s.state.connectionId, { store })
			s.setAll(streams)
		},
		//#endregion

		async fetchIfVoid(_: void, store?: StreamsStore) {
			if (!!store.state.all) return
			await store.fetch()
		},
		/** open CREATION CARD */
		create(_: void, store?: StreamsStore) {
			const view = buildStreamNew(store.state.connectionId, store.getAllStreamName())
			docSo.addLink({ view, parent: store, anim: true })
			store.setSelect(null)
		},
		/** elimina lo sTREAM selezionato "state.select" */
		async delete(_: void, store?: StreamsStore) {
			if (!await store.alertOpen({
				title: "STREAM DELETION",
				body: "This action is irreversible.\nAre you sure you want to delete the STREAM?",
			})) return

			const name = store.state.select
			await strApi.remove(store.state.connectionId, name, { store })
			store.setAll(store.state.all.filter(s => s.config.name != name))
			store.setSelect(null)
			// cerco eventuali CARD di questo stream e lo chiudo
			const cardStreams = docSo.findAll({ type: DOC_TYPE.STREAM, connectionId: store.state.connectionId })
			cardStreams.forEach(view => docSo.remove({ view, anim: true }))
		},

		update(stream: StreamInfo, store?: StreamsStore) {
			const all = [...store.state.all]
			const index = store.getIndexByName(stream.config?.name)
			index == -1 ? all.push(stream) : (all[index] = { ...all[index], ...stream })
			store.setAll(all)
		},

		async purge({ seq, keep, subject }: { seq: number, keep: number, subject: string }, store?: StreamsStore) {
			const name = store.state.select
			if (!name) return
			await strApi.purge(store.state.connectionId, name, seq, keep, subject, { store })
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
		setTextSearch: (textSearch: string) => ({ textSearch }),
		setPurgeOpen: (purgeOpen: boolean) => ({ purgeOpen }),
	},
}

export type StreamsState = typeof setup.state & ViewState & LoadBaseState
export type StreamsGetters = typeof setup.getters
export type StreamsActions = typeof setup.actions
export type StreamsMutators = typeof setup.mutators
export interface StreamsStore extends ViewStore, LoadBaseStore, StoreCore<StreamsState>, StreamsGetters, StreamsActions, StreamsMutators {
	state: StreamsState
}
const streamsSetup = mixStores(docSetup, loadBaseSetup, setup)
export default streamsSetup
