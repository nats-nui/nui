import srcIcon from "@/assets/msg-hdr.svg"
import { socketPool } from "@/plugins/SocketService/pool"
import { PayloadMessage } from "@/plugins/SocketService/types"
import cnnSo from "@/stores/connections"
import docsSo from "@/stores/docs"
import { buildStore, createUUID } from "@/stores/docs/utils/factory"
import docSetup, { ViewStore } from "@/stores/docs/viewBase"
import { DOC_TYPE, Subscription } from "@/types"
import { StoreCore, mixStores } from "@priolo/jon"
import { ViewState } from "../../docs/viewBase"
import { MessageState } from "../message"
import { MessageSendState } from "../send"
import historyTest from "./test"
import { HistoryMessage, MSG_FORMAT, MSG_TYPE, PARAMS_MESSAGES } from "./utils"



const setup = {

	state: {
		params: { [PARAMS_MESSAGES.CONNECTION_ID]: <string[]>null },
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
			const id = store.getParam(PARAMS_MESSAGES.CONNECTION_ID)
			return cnnSo.getById(id)
		},
		getTitle: (_: void, store?: ViewStore) => (<MessagesStore>store).getConnection()?.name,
		getIcon: (_: void, store?: ViewStore) => srcIcon,
	},

	actions: {
		onCreate(_: void, store?: ViewStore) {
			const msgSo = <MessagesStore>store
			const cnn = msgSo.getConnection()
			const ss = socketPool.create(store.state.uuid, cnn.id)
			ss.onOpen = () => msgSo.sendSubscriptions()
			ss.onMessage = message => msgSo.addInHistory(message)
		},
		onDestroy(_: void, store?: ViewStore) {
			socketPool.destroy(store.state.uuid)
			docSetup.actions.onDestroy(null, store)
		},
		/** aggiungo alla history di questo stack */
		addInHistory(message: PayloadMessage, store?: MessagesStore) {
			const historyMessage: HistoryMessage = {
				id: createUUID(),
				title: `${message.subject} [${store.state.history.length}]`,
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
}

export type MessagesState = typeof setup.state & ViewState
export type MessagesGetters = typeof setup.getters
export type MessagesActions = typeof setup.actions
export type MEssagesMutators = typeof setup.mutators
export interface MessagesStore extends ViewStore, StoreCore<MessagesState>, MessagesGetters, MessagesActions, MEssagesMutators {
	state: MessagesState
}
const msgSetup = mixStores(docSetup, setup)
export default msgSetup


