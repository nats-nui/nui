import strApi from "@/api/streams"
import { buildMessageDetail } from "@/stores/docs/utils/factory"
import { COLOR_VAR } from "@/stores/layout"
import viewSetup, { ViewStore } from "@/stores/stacks/viewBase"
import { Message } from "@/types/Message"
import { StreamInfo } from "@/types/Stream"
import { StoreCore, mixStores } from "@priolo/jon"
import editorSetup, { EditorState, EditorStore } from "../editorBase"
import loadBaseSetup, { LoadBaseState, LoadBaseStore } from "../loadBase"
import { ViewState } from "../viewBase"
import { StreamMessagesFilter } from "./utils/filter"
import { MESSAGE_TYPE } from "@/stores/log/utils"
import { DOC_TYPE } from "@/types"
import { MessageStore } from "../message"



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
		subjectsCustom: <string[]>[],
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

		//#region OVERWRITE

		setSerialization: (data: any, store?: ViewStore) => {
			viewSetup.actions.setSerialization(data, store)
			const state = store.state as StreamMessagesState
			state.connectionId = data.connectionId
			state.stream = data.stream
			state.format = data.format
			state.textSearch = data.textSearch
			state.filter = data.filter
		},
		/** chiamato dallo store parent "LoaderBase" */
		fetch: async (_: void, loadStore?: LoadBaseStore) => {
			const store = <StreamMessagesStore>loadStore
			store.fetchNext()
		},
		/** il primo caricamento dei dati da visualizzare */
		fetchInit: async (_: void, loadStore?: LoadBaseStore) => {
			const store = <StreamMessagesStore>loadStore
			if (!store.state.stream?.config?.name || !store.state.connectionId || !store.state.stream?.state) {
				console.error("no params")
				return
			}
			store.state.rangeTop = null
			store.state.filter.interval = globalInterval
			store.state.filter.startSeq = store.state.stream.state.lastSeq
			await store.fetchWithFilter({
				interval: -globalInterval,
				startSeq: store.state.stream.state.lastSeq,
			})
			await loadBaseSetup.actions.fetch(_, store)
		},

		//#endregion

		async fetchIfVoid(_: void, store?: StreamMessagesStore) {
			if (!!store.state.messages) return
			await store.fetchInit()
		},

		/** effettua una richiesta indicando un filtro */
		fetchWithFilter: async (
			filter: StreamMessagesFilter,
			store?: StreamMessagesStore
		) => {
			const name = store.state.stream?.config?.name
			let pre = filter.interval < 0

			if (filter.startSeq < store.state.stream.state.firstSeq) return 0
			if (filter.startSeq + filter.interval < store.state.stream.state.firstSeq) {
				filter.interval = filter.startSeq - store.state.stream.state.firstSeq + 1
				filter.startSeq = store.state.stream.state.firstSeq
				pre = true
			}
			if (filter.interval == 0) return 0

			// FETCH
			const msgs = await strApi.messages(store.state.connectionId, name, filter, { store, manageAbort: true }) ?? []

			// ADD
			let all = store.state.messages ?? []
			if (pre) {
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
			const subjects = [...store.state.filter.subjects, ...store.state.subjectsCustom]
			return store.fetchWithFilter({ startSeq, interval, subjects })
		},

		fetchNext: async (_?: void, store?: StreamMessagesStore) => {
			const startSeq = store.state.messages[store.state.messages.length - 1].seqNum + 1
			const interval = store.state.filter.interval
			if (interval == 0 /*|| startSeq >= store.state.stream.state.lastSeq*/) return 0
			const subjects = [...store.state.filter.subjects, ...store.state.subjectsCustom]
			return store.fetchWithFilter({ startSeq, interval, subjects })
		},

		/** applico il filtro ricaricando completamente tutti i messages */
		filterApply: async (filter: StreamMessagesFilter, store?: StreamMessagesStore) => {

			// normalizzo e setto il filtro
			if (!filter.interval) filter.interval = 200
			if (filter.startSeq == null && !filter.byTime) {
				filter.startSeq = store.state.stream.state.lastSeq - filter.interval
			}
			store.setFilter(filter)

			const filterToSend = { ...filter }
			filterToSend.subjects = [...filter.subjects, ...store.state.subjectsCustom]

			// chiedo al BE 
			const msgs = await strApi.messages(store.state.connectionId, store.state.stream.config.name, filterToSend, { store })
			store.state.rangeTop = filter.startSeq ?? msgs?.[0]?.seqNum
			store.setMessages(msgs)
		},

		/** apertura CARD MESSAGE-DETAIL */
		openMessageDetail(message: Message, store?: StreamMessagesStore) {
			const msgOld = (store.state.linked as MessageStore)?.state.message
			const view = msgOld?.seqNum == message?.seqNum ? null : buildMessageDetail(message, store.state.format)
			store.state.group.addLink({ view, parent: store, anim: !msgOld || !view })
		},

		/** elimina un messaggio  */
		async deleteMessage(message: Message, store?: StreamMessagesStore) {
			if (!await store.alertOpen({
				title: "MESSAGE DELETE",
				body: "This action is irreversible.\nAre you sure you want to delete the MESSAGE?",
			})) return
			await strApi.messageRemove(store.state.connectionId, store.state.stream.config.name, message.seqNum, { store })
			store.setMessages(store.state.messages.filter(m => m.seqNum != message.seqNum))
			store.setSnackbar({
				open: true, type: MESSAGE_TYPE.SUCCESS, timeout: 5000,
				title: "DELETED",
				body: "it is gone forever",
			})
		},
	},

	mutators: {
		setMessages: (messages: Message[]) => ({ messages }),
		setTextSearch: (textSearch: string) => ({ textSearch }),
		setFilter: (filter: StreamMessagesFilter) => {
			globalInterval = filter.interval
			return { filter }
		},
		setSubjectsCustom: (subjectsCustom: string[]) => ({ subjectsCustom }),
		setFiltersOpen: (filtersOpen: boolean) => ({ filtersOpen }),
	},
}

export type StreamMessagesState = typeof setup.state & ViewState & LoadBaseState & EditorState
export type StreamMessagesGetters = typeof setup.getters
export type StreamMessagesActions = typeof setup.actions
export type StreamMessagesMutators = typeof setup.mutators
export interface StreamMessagesStore extends ViewStore, LoadBaseStore, EditorStore, StoreCore<StreamMessagesState>, StreamMessagesGetters, StreamMessagesActions, StreamMessagesMutators {
	state: StreamMessagesState
}
const streamMessagesSetup = mixStores(viewSetup, loadBaseSetup, editorSetup, setup)
export default streamMessagesSetup

