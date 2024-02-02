import strApi from "@/api/streams"
import srcIcon from "@/assets/MessagesIcon.svg"
import { COLOR_VAR } from "@/stores/layout"
import viewSetup, { ViewStore } from "@/stores/stacks/viewBase"
import { Message } from "@/types/Message"
import { StreamInfo } from "@/types/Stream"
import { StoreCore, mixStores } from "@priolo/jon"
import { MSG_FORMAT } from "../messages/utils"
import { ViewState } from "../viewBase"


export interface StreamMessagesFilter {
	/** SUBJECTS selezionati da filtrare */
	subjects?: string[]
	/** numero di MESSAGES da ricavare ogni loading */
	interval?: number
	/** sequenza iniziale */
	startSeq?: number
	startTime?: number
	byTime?: boolean
}


const setup = {

	state: {
		connectionId: <string>null,
		stream: <Partial<StreamInfo>>null,
		/** messaggi da visualizzare */
		messages: <Message[]>null,
		/** testo per la ricerca */
		textSearch: <string>null,
		/** filtro da applicare */
		filter: <StreamMessagesFilter>{
			subjects: [],
			interval: 10,
			startSeq: null,
			startTime: null,
		},
		/** DIALOG FILTER aperta */
		filtersOpen: false,

		format: MSG_FORMAT.JSON,
		formatsOpen: false,

		//#region VIEWBASE
		colorVar: COLOR_VAR.CYAN,
		//#endregion
	},

	getters: {

		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) => (<StreamMessagesStore>store).state.stream?.config?.name ?? "???",
		getSubTitle: (_: void, store?: ViewStore) => "STREAM-MESSAGES",
		getIcon: (_: void, store?: ViewStore) => srcIcon,
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
		//#endregion

		/** carica i dati da visualizzare */
		fetch: async (_: void, store?: StreamMessagesStore) => {
			if (!store.state.stream?.config?.name || !store.state.connectionId) {
				console.error("no params")
				return null
			}
			// controllo ci sia lo STREAM
			if (!store.state.stream?.state) {
				// [II] RECUPERO LO STREAM-STATE
			}
			// si tratta della prima visualizzazione
			if (!store.state.messages) {
				await store.fetchPrev(store.state.stream.state.lastSeq)
			}
		},
		fetchPrev: async (seq?: number, store?: StreamMessagesStore) => {
			let interval = store.state.filter.interval
			if (interval <= 0) return
			const name = store.state.stream.config.name
			const { firstSeq, lastSeq } = store.state.stream.state


			//***** */
			if (seq == null && store.state.messages?.length > 0) seq = store.state.messages[0].seqNum
			if (seq == null) seq = firstSeq
			let startSeq = seq - interval
			if (startSeq < firstSeq) {
				interval = seq - firstSeq
				startSeq = firstSeq
			}
			if (interval <= 0) return
			//***** */


			const msgs = await strApi.messages(store.state.connectionId, name, { startSeq, interval })



			if (!msgs || msgs.length == 0) return
			const ret = msgs.length
			let all = store.state.messages ?? []

			//***** */			
			const msgsSeq = msgs[msgs.length - 1].seqNum
			const indexOverlap = all.findIndex(msg => msg.seqNum == msgsSeq)
			if (indexOverlap != -1) all = all.slice(indexOverlap + 1)
			store.setMessages(msgs.concat(all))
			//***** */

			return ret
		},
		fetchNext: async (seq?: number, store?: StreamMessagesStore) => {
			let interval = store.state.filter.interval
			if (interval <= 0) return
			const name = store.state.stream.config.name
			const { firstSeq, lastSeq } = store.state.stream.state


			//***** */
			if (seq == null && store.state.messages?.length > 0) seq = store.state.messages[store.state.messages.length - 1].seqNum
			if (seq == null) seq = lastSeq
			let startSeq = seq + 1
			//***** */


			const msgs = await strApi.messages(store.state.connectionId, name, { startSeq, interval })



			if (!msgs || msgs.length == 0) return 0
			const ret = msgs.length
			let all = store.state.messages ?? []

			//***** */
			const msgsFirstSeq = msgs[0].seqNum
			const indexOverlap = all.findIndex(msg => msg.seqNum == msgsFirstSeq)
			if (indexOverlap != -1) all = all.slice(0, indexOverlap)
			store.setMessages(all.concat(msgs))
			//***** */

			return ret
		},
		filterApply: async (filter: StreamMessagesFilter, store?: StreamMessagesStore) => {
			const oldFilter = store.state.filter
			if (filter.byTime == oldFilter.byTime
				&& filter.startSeq == oldFilter.startSeq
				&& filter.startTime == oldFilter.startTime
				&& filter.subjects.sort().join("").toLowerCase() == oldFilter.subjects.sort().join("").toLowerCase()
			) {
				store.setFilter(filter)
				return
			}
			if ( !filter.interval ) filter.interval = 100
			if ( filter.startSeq == null && !filter.byTime) {
				filter.startSeq = store.state.stream.state.lastSeq -filter.interval
			}

			store.setFilter(filter)
			const msgs = await strApi.messages(store.state.connectionId, store.state.stream.config.name, filter)
			store.setMessages(msgs)
		},
	},

	mutators: {
		setMessages: (messages: Message[]) => ({ messages }),
		setFormat: (format: MSG_FORMAT) => ({ format }),
		setFormatsOpen: (formatsOpen: boolean) => ({ formatsOpen }),
		setTextSearch: (textSearch: string) => ({ textSearch }),
		setFilter: (filter: StreamMessagesFilter) => ({ filter }),
		setFiltersOpen: (filtersOpen: boolean) => ({ filtersOpen }),
	},
}

export type StreamMessagesState = typeof setup.state & ViewState
export type StreamMessagesGetters = typeof setup.getters
export type StreamMessagesActions = typeof setup.actions
export type StreamMessagesMutators = typeof setup.mutators
export interface StreamMessagesStore extends ViewStore, StoreCore<StreamMessagesState>, StreamMessagesGetters, StreamMessagesActions, StreamMessagesMutators {
	state: StreamMessagesState
}
const streamMessagesSetup = mixStores(viewSetup, setup)
export default streamMessagesSetup

