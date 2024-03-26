import strApi from "@/api/streams"
import docsSo from "@/stores/docs"
import { buildMessageDetail } from "@/stores/docs/utils/factory"
import { COLOR_VAR } from "@/stores/layout"
import viewSetup, { ViewStore } from "@/stores/stacks/viewBase"
import { Message } from "@/types/Message"
import { StreamInfo } from "@/types/Stream"
import { StoreCore, mixStores } from "@priolo/jon"
import editorSetup, { EditorState, EditorStore } from "../editorBase"
import { ViewState } from "../viewBase"
import { StreamMessagesFilter } from "./utils/filter"
import { LOAD_STATE } from "../utils"



let globalInterval = 50

const setup = {

	state: {

		/** messaggi da visualizzare */
		messages: <Message[]>null,
		/** testo per la ricerca */
		textSearch: <string>null,
		/** filtro da applicare */
		filter: <StreamMessagesFilter>{
			subjects: [],
			interval: globalInterval,
			startSeq: null,
			startTime: null,
		},
		/** DIALOG FILTER aperta */
		filtersOpen: false,

		// NOT REACTIVE
		connectionId: <string>null,
		stream: <Partial<StreamInfo>>null,
		/** sequenza primo messaggio della lista */
		rangeTop: <number>null,

		//#region VIEWBASE
		colorVar: COLOR_VAR.CYAN,
		//#endregion
		loadingState: LOAD_STATE.IDLE,
	},

	getters: {

		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) => "STREAM MESSAGES",
		getSubTitle: (_: void, store?: ViewStore) => (<StreamMessagesStore>store).state.stream?.config?.name ?? "--",
		getSerialization: (_: void, store?: ViewStore) => {
			const state = store.state as StreamMessagesState
			return {
				...viewSetup.getters.getSerialization(null, store),
				connectionId: state.connectionId,
				stream: state.stream, // bisogna memorizzare solo il config.name
				format: state.format,
				textSearch: state.textSearch,
				filter: { ...state.filter }
			}
		},
		//#endregion

		getIndexBySeq: (seq: number, store?: StreamMessagesStore) => store.state.messages.findIndex(m => m.seqNum == seq),
		getFiltered: (_: void, store?: StreamMessagesStore) => {
			const text = store.state.textSearch?.toLocaleLowerCase()?.trim()
			if (!text || text.length == 0 || !store.state.messages) return store.state.messages
			return store.state.messages.filter(message =>
				message.payload.toLowerCase().includes(text)
				|| message.subject.toLowerCase().includes(text)
			)
		},

	},

	actions: {

		//#region VIEWBASE
		setSerialization: (data: any, store?: ViewStore) => {
			viewSetup.actions.setSerialization(data, store)
			const state = store.state as StreamMessagesState
			state.connectionId = data.connectionId
			state.stream = data.stream
			state.format = data.format
			state.textSearch = data.textSearch
			state.filter = data.filter
		},
		onCreate: (_: void, store?: ViewStore) => {
			const s = store as StreamMessagesStore
			s.state.filter.interval = globalInterval
		},
		//#endregion

		/** prima carica dei dati da visualizzare */
		fetch: async (_: void, store?: StreamMessagesStore) => {
			if (!store.state.stream?.config?.name || !store.state.connectionId || !store.state.stream?.state) {
				console.error("no params")
				return null
			}
			store.state.rangeTop = null
			await store.fetchWithFilter({
				interval: -store.state.filter.interval,
				startSeq: store.state.stream.state.lastSeq
			})

						
		},

		async fetchIfVoid(_: void, store?: StreamMessagesStore) {
			if (!!store.state.messages) return
			await store.fetch()
		},

		/** effettua una richiesta indicando un filtro */
		fetchWithFilter: async (
			filter: StreamMessagesFilter,
			store?: StreamMessagesStore
		) => {
			const name = store.state.stream?.config?.name
			const msgs = await strApi.messages(store.state.connectionId, name, filter, { store }) ?? []
			let all = store.state.messages ?? []
			if (filter.interval < 0) {
				store.setMessages(msgs.concat(all))
			} else {
				store.setMessages(all.concat(msgs))
			}
			return msgs.length
		},

		fetchPrev: async (_?: void, store?: StreamMessagesStore) => {
			const startSeq = store.state.messages[0].seqNum - 1
			const interval = -store.state.filter.interval
			if (interval == 0 || startSeq <= store.state.stream.state.firstSeq) return 0
			return store.fetchWithFilter({ startSeq, interval })
		},

		fetchNext: async (_?: void, store?: StreamMessagesStore) => {
			const startSeq = store.state.messages[store.state.messages.length - 1].seqNum + 1
			const interval = store.state.filter.interval
			if (interval == 0 /*|| startSeq >= store.state.stream.state.lastSeq*/) return 0
			return store.fetchWithFilter({ startSeq, interval })
		},

		filterApply: async (filter: StreamMessagesFilter, store?: StreamMessagesStore) => {

			// controlla se il filtro è cambiato
			const oldFilter = store.state.filter
			if (filter.byTime == oldFilter.byTime
				&& filter.startSeq == oldFilter.startSeq
				&& filter.startTime == oldFilter.startTime
				&& filter.subjects.sort().join("").toLowerCase() == oldFilter.subjects.sort().join("").toLowerCase()
			) {
				store.setFilter(filter)
				return
			}

			// normalizzo e setto il filtro
			if (!filter.interval) filter.interval = 200
			if (filter.startSeq == null && !filter.byTime) {
				filter.startSeq = store.state.stream.state.lastSeq - filter.interval
			}
			store.setFilter(filter)

			// chiedo al BE 
			const msgs = await strApi.messages(store.state.connectionId, store.state.stream.config.name, filter, { store })
			store.state.rangeTop = filter.startSeq ?? msgs?.[0]?.seqNum
			store.setMessages(msgs)
		},

		/** apertura CARD MESSAGE-DETAIL */
		openMessageDetail(message: Message, store?: StreamMessagesStore) {
			docsSo.addLink({
				view: buildMessageDetail(message, store.state.format),
				parent: store,
				anim: true,
			})
		},

		/** elimina un messaggio  */
		async deleteMessage(message: Message, store?: StreamMessagesStore) {
			if (!await store.alertOpen({
				title: "MESSAGE DELETE",
				body: "This action is irreversible.\nAre you sure you want to delete the MESSAGE?",
			})) return

			await strApi.messageRemove(store.state.connectionId, store.state.stream.config.name, message.seqNum, { store })
			store.setMessages(store.state.messages.filter(m => m.seqNum != message.seqNum))
		},
	},

	mutators: {
		setMessages: (messages: Message[]) => ({ messages }),
		setTextSearch: (textSearch: string) => ({ textSearch }),
		setFilter: (filter: StreamMessagesFilter) => {
			globalInterval = filter.interval
			return { filter }
		},
		setFiltersOpen: (filtersOpen: boolean) => ({ filtersOpen }),

		setLoadingState: (loadingState: LOAD_STATE) => ({ loadingState }),
	},
}

export type StreamMessagesState = typeof setup.state & ViewState & EditorState
export type StreamMessagesGetters = typeof setup.getters
export type StreamMessagesActions = typeof setup.actions
export type StreamMessagesMutators = typeof setup.mutators
export interface StreamMessagesStore extends ViewStore, EditorStore, StoreCore<StreamMessagesState>, StreamMessagesGetters, StreamMessagesActions, StreamMessagesMutators {
	state: StreamMessagesState
}
const streamMessagesSetup = mixStores(viewSetup, editorSetup, setup)
export default streamMessagesSetup

