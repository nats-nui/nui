import srcIcon from "@/assets/MessagesIcon.svg"
import { socketPool } from "@/plugins/SocketService/pool"
import { PayloadMessage } from "@/plugins/SocketService/types"
import cnnSo from "@/stores/connections"
import docsSo from "@/stores/docs"
import { buildStore, createUUID } from "@/stores/docs/utils/factory"
import { COLOR_VAR } from "@/stores/layout"
import viewSetup, { ViewStore } from "@/stores/stacks/viewBase"
import { DOC_TYPE, Subscription } from "@/types"
import { StoreCore, mixStores } from "@priolo/jon"
import { MessageState } from "../message"
import { MessageSendState } from "../send"
import { ViewState } from "../viewBase"
import historyTest from "./test"
import { HistoryMessage, MSG_FORMAT, MSG_TYPE } from "./utils"



const setup = {

	state: {
		connectionId: <string>null,
		/** SUBS sui quali rimanere in ascolto */
		subscriptions: <Subscription[]>[],
		lastSubjects: <string[]>null,
		/** tutti i messaggi ricevuti */
		history: <HistoryMessage[]>historyTest,//[],
		/** testo per la ricerca */
		textSearch: <string>null,
		/** DIALOG SUBS aperta */
		subscriptionsOpen: false,

		format: MSG_FORMAT.JSON,
		formatsOpen: false,
	},

	getters: {
		getConnection: (_: void, store?: MessagesStore) => {
			return cnnSo.getById(store.state.connectionId)
		},
		getHistoryFiltered: (_: void, store?: MessagesStore) => {
			const text = store.state.textSearch?.toLocaleLowerCase()
			if ( !text || text.trim().length == 0 ) return store.state.history
			return store.state.history.filter( h => 
				h.body.toLowerCase().includes(text)
				|| h.title.toLowerCase().includes(text)
			)
		},

		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) => (<MessagesStore>store).getConnection()?.name,
		getSubTitle: (_: void, store?: ViewStore) => "MESSAGES",
		getIcon: (_: void, store?: ViewStore) => srcIcon,
		getColorVar: (_: void, store?: ViewStore) => COLOR_VAR.CYAN,
		getSerialization: (_: void, store?: ViewStore) => {
			const state = store.state as MessagesState
			return {
				...viewSetup.getters.getSerialization(null, store),
				connectionId: state.connectionId,
				subscriptions: state.subscriptions,
				history: state.history,
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
			const state = store.state as MessagesState
			state.connectionId = data.connectionId
			state.subscriptions = data.subscriptions
			state.history = data.history
			state.textSearch = data.textSearch
			state.format = data.format
		},
		onCreate(_: void, store?: ViewStore) {
			const msgSo = <MessagesStore>store
			const cnnId = msgSo.state.connectionId
			const ss = socketPool.create(store.state.uuid, cnnId)
			ss.onOpen = () => msgSo.sendSubscriptions()
			ss.onMessage = message => msgSo.addInHistory(message)
			ss.onStatus = status => {

			}
			ss.onError = error => {
				
			}
		},
		onDestroy(_: void, store?: ViewStore) {
			socketPool.destroy(store.state.uuid)
			viewSetup.actions.onDestroy(null, store)
		},
		//#endregion

		/** aggiungo alla history di questo stack */
		addInHistory(message: PayloadMessage, store?: MessagesStore) {
			const historyMessage: HistoryMessage = {
				id: createUUID(),
				title: message.subject,
				body: message.payload as string,
				type: MSG_TYPE.MESSAGE,
				timestamp: Date.now(),
			}
			store.setHistory([...store.state.history, historyMessage])
		},
		/** aggiorno i subjects di questo stack messages */
		sendSubscriptions: (_: void, store?: MessagesStore) => {
			const subjects = store.state.subscriptions
				?.filter(s => !!s?.subject && !s.disabled)
				.map(s => s.subject) ?? []
			if (store.state.lastSubjects && store.state.lastSubjects.length == subjects.length && subjects.every(s => store.state.lastSubjects.includes(s))) return
			socketPool.getById(store.state.uuid).sendSubjects(subjects)
			store.state.lastSubjects = subjects
		},
		/** apertura CARD MESSAGE-DETAIL */
		openMessageDetail(message: HistoryMessage, store?: MessagesStore) {
			const cnn = store.getConnection()
			if (!cnn) return
			const msgStore = buildStore({
				type: DOC_TYPE.MESSAGE,
				message,
				format: store.state.format,
			} as MessageState)
			docsSo.addLink({
				view: msgStore,
				parent: store,
				anim: true,
			})
		},
		/** apertura CARD MESSAGE-SEND */
		openMessageSend(_: void, store?: MessagesStore) {
			const cnn = store.getConnection()
			if (!cnn) return
			const msgSendStore = buildStore({
				type: DOC_TYPE.MESSAGE_SEND,
				connectionId: cnn.id,
			} as MessageSendState)
			docsSo.addLink({
				view: msgSendStore,
				parent: store,
				anim: true,
			})
		},
	},

	mutators: {
		setSubscriptions: (subscriptions: Subscription[]) => ({ subscriptions }),
		setHistory: (history: HistoryMessage[]) => ({ history }),
		setSubscriptionsOpen: (subscriptionsOpen: boolean) => ({ subscriptionsOpen }),
		setTextSearch: (textSearch: string) => ({ textSearch }),

		setFormat: (format: MSG_FORMAT) => ({ format }),
		setFormatsOpen: (formatsOpen: boolean) => ({ formatsOpen }),
	},

	onListenerChange: (store:MessagesStore) => {
		console.log("CREATE", store._listeners.size)
		// if ( store._listeners.size == 1 ) {
		// 	store.onCreate()
		// } else if (store._listeners.size == 0 ) {
		// 	store.onDestroy()
		// }
	}
}

export type MessagesState = typeof setup.state & ViewState
export type MessagesGetters = typeof setup.getters
export type MessagesActions = typeof setup.actions
export type MEssagesMutators = typeof setup.mutators
export interface MessagesStore extends ViewStore, StoreCore<MessagesState>, MessagesGetters, MessagesActions, MEssagesMutators {
	state: MessagesState
}
const msgSetup = mixStores(viewSetup, setup)
export default msgSetup


