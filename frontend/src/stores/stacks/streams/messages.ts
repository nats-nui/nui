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

let globalInterval = 50

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
		rangeTop: <number>null,

		//#region VIEWBASE
		colorVar: COLOR_VAR.CYAN,
		//#endregion
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
				store.state.rangeTop = null
				await store.fetchInterval({
					interval: -store.state.filter.interval,
					seq: store.state.stream.state.lastSeq
				})
			}
		},

		fetchInterval: async (
			{ seq, interval }: { seq: number, interval: number },
			store?: StreamMessagesStore
		) => {
			//const { firstSeq, lastSeq } = store.state.stream.state

			//***** */
			// if (seq == null) {
			// 	if (store.state.messages?.length > 0) {
			// 		seq = store.state.messages[store.state.messages.length - 1].seqNum + 1
			// 	} else {
			// 		seq = firstSeq
			// 	}
			// }
			const startSeq = seq
			//***** */

			const name = store.state.stream.config.name
			const msgs = await strApi.messages(store.state.connectionId, name, { startSeq, interval }, { store })
			if (!msgs || msgs.length == 0) return 0
			const ret = msgs.length
			let all = store.state.messages ?? []

			//***** */
			if (interval < 0) {
				store.setMessages(msgs.concat(all))
			} else {
				// const msgsFirstSeq = msgs[0].seqNum
				// const indexOverlap = all.findIndex(msg => msg.seqNum == msgsFirstSeq)
				// if (indexOverlap != -1) all = all.slice(0, indexOverlap)
				store.setMessages(all.concat(msgs))
			}
			//***** */

			return ret
		},



		fetchPrevRec: async (_: void, store?: StreamMessagesStore) => {
			let msgsTot = 0
			let desired = store.state.filter.interval
			for (let i = 0; i < 200; i++) {
				const msgsLoad = await store.fetchPrev()
				if (msgsLoad == null) break
				msgsTot += msgsLoad
				if (msgsTot >= desired) break
				store.state.filter.interval = Math.round(store.state.filter.interval * 1.5)
			}
			store.state.filter.interval = desired
			return msgsTot
		},
		fetchPrev2: async (_?: void, store?: StreamMessagesStore) => {
			const seq = store.state.messages[0].seqNum - 1
			const interval = -store.state.filter.interval
			if ( interval == 0 || seq <= store.state.stream.state.firstSeq ) return 0
			return store.fetchInterval({ seq, interval })
		},
		fetchPrev: async (seq?: number, store?: StreamMessagesStore) => {
			let interval = store.state.filter.interval
			if (interval <= 0) return null
			const { firstSeq, lastSeq } = store.state.stream.state

			//***** */
			if (seq == null) {
				if (store.state.messages?.length > 0) {
					seq = store.state.rangeTop ?? store.state.messages[0].seqNum
					if (seq == firstSeq) return null
				} else {
					seq = store.state.rangeTop ?? lastSeq
				}
			}
			let startSeq = seq - interval
			if (startSeq < firstSeq) {
				startSeq = firstSeq
				interval = seq - firstSeq + 1
			}
			if (interval <= 0) return null
			//***** */

			const name = store.state.stream.config.name
			const msgs = await strApi.messages(store.state.connectionId, name, { startSeq, interval }, { store })



			const ret = msgs.length
			let all = store.state.messages ?? []

			//***** */			
			store.state.rangeTop = startSeq
			const msgsSeq = msgs[msgs.length - 1]?.seqNum
			const indexOverlap = all.findIndex(msg => msg.seqNum == msgsSeq)
			if (indexOverlap != -1) all = all.slice(indexOverlap + 1)
			store.setMessages(msgs.concat(all))
			//***** */

			return ret
		},



		fetchNext2: async (_?: void, store?: StreamMessagesStore) => {
			const seq = store.state.messages[store.state.messages.length - 1].seqNum + 1
			const interval = store.state.filter.interval
			if ( interval == 0 || seq >= store.state.stream.state.lastSeq ) return 0
			return store.fetchInterval({ seq, interval })
		},
		fetchNext: async (seq?: number, store?: StreamMessagesStore) => {
			let interval = store.state.filter.interval
			if (interval <= 0) return
			const { firstSeq, lastSeq } = store.state.stream.state

			//***** */
			if (seq == null) {
				if (store.state.messages?.length > 0) {
					seq = store.state.messages[store.state.messages.length - 1].seqNum + 1
				} else {
					seq = firstSeq
				}
			}
			const startSeq = seq
			//***** */

			const name = store.state.stream.config.name
			const msgs = await strApi.messages(store.state.connectionId, name, { startSeq, interval }, { store })
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
			if (!filter.interval) filter.interval = 200
			if (filter.startSeq == null && !filter.byTime) {
				filter.startSeq = store.state.stream.state.lastSeq - filter.interval
			}

			store.setFilter(filter)
			const msgs = await strApi.messages(store.state.connectionId, store.state.stream.config.name, filter, { store })
			store.state.rangeTop = filter.startSeq ?? msgs[0].seqNum
			store.setMessages(msgs)
		},
		/** apertura CARD MESSAGE-DETAIL */
		openMessageDetail(message: Message, store?: StreamMessagesStore) {
			// message = {
			// 	subject: "test",
			// 	payload: '{"pippo": 45, "pluto": { "var1": 1, "var2": 2}, "paperino": "www"}',
			// }
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
			return {filter} 
		},
		setFiltersOpen: (filtersOpen: boolean) => ({ filtersOpen }),
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

