import { SocketService } from "@/plugins/SocketService"
import cnnSo from "@/stores/connections"
import docsSo from "@/stores/docs"
import { buildStore, createUUID } from "@/stores/docs/utils/factory"
import docSetup, { ViewStore } from "@/stores/docs/viewBase"
import { DOC_TYPE, Subscription } from "@/types"
import { StoreCore, mixStores } from "@priolo/jon"
import { ViewState } from "../../docs/viewBase"
import { HistoryMessage, PARAMS_MESSAGES } from "./utils"
import { MessageState } from "../message"
import { MessageSendState } from "../send"
import srcIcon from "@/assets/msg-hdr.svg"
import { PayloadMessage } from "@/plugins/SocketService/types"
import { socketPool } from "@/plugins/SocketService/pool"


const data = [
]
const h: HistoryMessage[] = Array.from({ length: 6 }, (_, i) => ({
	id: createUUID(),
	title: `title-${Math.random()} [${i}]`,
	//body: `body ${i} - ${"a".repeat(Math.round(Math.random() * 200))}`,
	json: data[i],
	timestamp: Date.now(),
	height: null,
}));



const setup = {

	state: {
		params: { [PARAMS_MESSAGES.CONNECTION_ID]: <string[]>null },
		subscriptions: <Subscription[]>[],
		lastSubjects: <string[]>null,
		history: <HistoryMessage[]>[],
		textSearch: <string>null,
		subscriptionsOpen: false,
		typesOpen: false,
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
			console.log("CREATE", store.state.uuid, cnn.id)
			const ss = socketPool.create(store.state.uuid, cnn.id)
			ss.onOpen = () => msgSo.sendSubscriptions()
			ss.onMessage = message => msgSo.addInHistory(message)
		},
		onDestroy(_: void, store?: ViewStore) {
			console.log("DESTROY")
			socketPool.destroy(store.state.uuid)
			docSetup.actions.onDestroy(null, store)
		},
		/** aggiungo alla history di questo stack */
		addInHistory(message: PayloadMessage, store?: MessagesStore) {
			const historyMessage: HistoryMessage = {
				id: createUUID(),
				title: `${message.subject} [${store.state.history.length}]`,
				body: message.payload as string,
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
				message
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
		setTypesOpen: (typesOpen: boolean) => ({ typesOpen }),
		setTextSearch: (textSearch: string) => ({ textSearch }),
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


