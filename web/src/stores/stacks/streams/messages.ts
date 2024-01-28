import srcIcon from "@/assets/MessagesIcon.svg"
import { COLOR_VAR } from "@/stores/layout"
import viewSetup, { ViewStore } from "@/stores/stacks/viewBase"
import { Subscription } from "@/types"
import { Message } from "@/types/Message"
import { StoreCore, mixStores } from "@priolo/jon"
import { MSG_FORMAT } from "../messages/utils"
import { ViewState } from "../viewBase"
import strApi from "@/api/streams"
import { StreamInfo } from "@/types/Stream"



const setup = {

	state: {
		connectionId: <string>null,
		stream: <Partial<StreamInfo>>null,
		/** messaggi da visualizzare */
		messages: <Message[]>null,

		/** SUBJECTS selezionati da filtrare */
		subjects: <string[]>[],
		/** testo per la ricerca */
		textSearch: <string>null,
		/** numero di MESSAGES da ricavare ogni loading */
		interval: 10,
		/** sequenza iniziale */
		startSeq: <number>null,
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
				subjects: state.subjects,
				textSearch: state.textSearch,
				format: state.format,
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
			state.subjects = data.subscriptions
			state.textSearch = data.textSearch
			state.format = data.format
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
			let interval = store.state.interval
			if (interval <= 0) return
			const name = store.state.stream.config.name
			const { firstSeq, lastSeq } = store.state.stream.state


//***** */
			if (seq == null && store.state.messages?.length > 0) seq = store.state.messages[0].seqNum
			if (seq == null) seq = firstSeq
			let seqStart = seq - interval
			if (seqStart < firstSeq) {
				interval = seq - firstSeq
				seqStart = firstSeq
			}
			if ( interval <= 0 ) return
//***** */


			const msgs = await strApi.messages(store.state.connectionId, name, seqStart, interval)



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
			let interval = store.state.interval
			if (interval <= 0) return
			const name = store.state.stream.config.name
			const { firstSeq, lastSeq } = store.state.stream.state


//***** */
			if (seq == null && store.state.messages?.length > 0) seq = store.state.messages[store.state.messages.length - 1].seqNum
			if (seq == null) seq = lastSeq
			let seqStart = seq + 1
//***** */


			const msgs = await strApi.messages(store.state.connectionId, name, seqStart, interval)



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

	},

	mutators: {
		setMessages: (messages: Message[]) => ({ messages }),
		setFormat: (format: MSG_FORMAT) => ({ format }),
		setFormatsOpen: (formatsOpen: boolean) => ({ formatsOpen }),

		setFiltersOpen: (filtersOpen: boolean) => ({ filtersOpen }),
		setTextSearch: (textSearch: string) => ({ textSearch }),
		setSubscriptions: (subscriptions: Subscription[]) => ({ subscriptions }),
		setStartSeq: (startSeq: number) => ({ startSeq }),
		setInterval: (interval: number) => ({ interval }),
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


