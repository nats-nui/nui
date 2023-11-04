import docSetup, { ViewStore } from "@/stores/docs/viewBase"
import { StoreCore } from "@priolo/jon"
import { ViewState } from "../../docs/viewBase"
import { mixStores } from "@priolo/jon"
import { SocketService } from "@/plugins/SocketService"
import { Subscription } from "@/types"
import cnnSo from "@/stores/connections"
import { SocketMessage } from "@/plugins/SocketService"

export interface HistoryMessage {
	title: string
	body: string
}

export enum PARAMS_MESSAGES {
	CONNECTION_ID = "cid"
}

const h = Array.from({length: 200}, (x, i)=> ({
	title: `title ${i} - ${Math.random()}`,
	body: `body ${i} - ${"a".repeat(Math.round(Math.random()*200))}`,
}));


const setup = {

	state: {
		params: {
			[PARAMS_MESSAGES.CONNECTION_ID]: <string[]>null
		},
		subscriptions: <Subscription[]>[],
		history: <HistoryMessage[]>[],
	},

	getters: {
	},

	actions: {
		connect(_: void, store?: MessagesStore) {
			const [id] = store.state.params?.[PARAMS_MESSAGES.CONNECTION_ID]
			const cnn = cnnSo.getById(id)
			if (!cnn) return
			store.ss = new SocketService({
				//base: "/ws/sub",
				onMessage: message => store.addInHistory(message)
			})
			store.ss.onOpen = () => store.setSubscriptions([...cnn.subscriptions])
			store.ss.connect()
		},
		disconnect(_: void, store?: MessagesStore) {
			store.ss.send({
				connection_id: store.getParam(PARAMS_MESSAGES.CONNECTION_ID, store),
				subjects: [],
			})
			store.ss.disconnect()
			store.ss = null
		},
		addInHistory(message: SocketMessage, store?: MessagesStore) {
			const historyMessage: HistoryMessage = {
				title: message.subject,
				body: message.payload as string
			}
			store.setHistory([...store.state.history, historyMessage])
		}
	},

	mutators: {
		setSubscriptions: (subscriptions: Subscription[], store?: MessagesStore) => {
			const connection_id = store.getParam(PARAMS_MESSAGES.CONNECTION_ID, store)
			const subjects = subscriptions?.map(s => s.subject) ?? []
			store.ss.send({
				connection_id,
				subjects,
			})
			return subscriptions
		},
		setHistory: (history: HistoryMessage[]) => ({ history }),
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
