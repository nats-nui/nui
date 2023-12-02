import cnnApi from "@/api/connection"
import { PayloadMessage, SocketService } from "@/plugins/SocketService"
import cnnSo from "@/stores/connections"
import { createUUID } from "@/stores/docs/utils/factory"
import docSetup, { ViewStore } from "@/stores/docs/viewBase"
import { Subscription } from "@/types"
import { StoreCore, mixStores } from "@priolo/jon"
import { ViewState } from "../../docs/viewBase"


export interface HistoryMessage {
	id: string
	timestamp: number
	title: string
	body: string
	height?: number
}

export enum PARAMS_MESSAGES {
	CONNECTION_ID = "cid"
}

// const h: HistoryMessage[] = Array.from({ length: 30 }, (_, i) => ({
// 	id: createUUID(),
// 	title: `title-${Math.random()} [${i}]`,
// 	body: `body ${i} - ${"a".repeat(Math.round(Math.random() * 200))}`,
// 	//body: `body ${i}`,
// 	timestamp: Date.now(),
// 	height: null,
// }));


const setup = {

	state: {
		params: {
			[PARAMS_MESSAGES.CONNECTION_ID]: <string[]>null
		},
		subscriptions: <Subscription[]>[],
		history: <HistoryMessage[]>[],

		subject:<string>null,
		message: <string>null,
		
		subscriptionsOpen: false,
		subjectOpen: false,

	},

	getters: {
		getConnection: (_: void, store?: MessagesStore) => {
			const id = store.getParam(PARAMS_MESSAGES.CONNECTION_ID)
			return cnnSo.getById(id)
		},
	},

	actions: {
		/** mi connetto al websocket */
		connect(_: void, store?: MessagesStore) {
			const cnn = store.getConnection()
			if (!cnn) return
			store.setSubscriptions([...cnn.subscriptions])

			//[II] mettere tutti i socketservices all'interno di un servizio esterno
			store.ss = new SocketService({
				onMessage: message => store.addInHistory(message)
			})
			store.ss.onOpen = () => store.sendSubscriptions()
			store.ss.connect(store.getParam(PARAMS_MESSAGES.CONNECTION_ID))
		},
		/** disconnessione websocket */
		disconnect(_: void, store?: MessagesStore) {
			store.ss.sendSubjects([])
			store.ss.disconnect()
			store.ss = null
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
		sendSubscriptions: (_:void, store?: MessagesStore) => {
			const subjects = store.state.subscriptions
				?.filter( s => s!=null && !s.disabled )
				.map(s => s.subject) ?? []
			store.ss.sendSubjects(subjects)
		},
		publishMessage: (_:void, store?: MessagesStore) => {
			const cnnId = store.getParam(PARAMS_MESSAGES.CONNECTION_ID, store)
			cnnApi.publish(cnnId, store.state.subject, store.state.message )
		},
	},

	mutators: {
		setSubscriptions: (subscriptions: Subscription[]) => ({ subscriptions }),
		setHistory: (history: HistoryMessage[]) => ({ history }),

		setMessage: (message: string) => ({ message }),
		setSubject: (subject: string) => ({ subject }),
		setSubjectOpen: (subjectOpen: boolean) => ({ subjectOpen }),
		setSubscriptionsOpen: (subscriptionsOpen: boolean) => ({ subscriptionsOpen }),
	},
}

export type MessagesState = typeof setup.state & ViewState
export type MessagesGetters = typeof setup.getters
export type MessagesActions = typeof setup.actions
export type MEssagesMutators = typeof setup.mutators
export interface MessagesStore extends ViewStore, StoreCore<MessagesState>, MessagesGetters, MessagesActions, MEssagesMutators {
	state: MessagesState
	ss: SocketService
}
const msgSetup = mixStores(docSetup, setup)
export default msgSetup
