import messagesApi from "@/api/messages"
import { socketPool } from "@/plugins/SocketService/pool"
import { PayloadMessage } from "@/plugins/SocketService/types"
import cnnSo from "@/stores/connections"
import { buildMessageDetail } from "@/stores/docs/utils/factory"
import { COLOR_VAR } from "@/stores/layout"
import viewSetup, { ViewStore } from "@/stores/stacks/viewBase"
import { Subscription } from "@/types"
import { MESSAGE_TYPE, Message } from "@/types/Message"
import { MSG_FORMAT } from "@/utils/editor"
import { LISTENER_CHANGE, StoreCore, mixStores } from "@priolo/jon"
import dayjs from "dayjs"
import { MessageStore } from "../../message"
import { ViewState } from "../../viewBase"
import { buildConnectionMessageSend } from "../utils/factory"



const MaxMessagesLength = 20000

export type MessageStat = {
	subject: string,
	counter: number,
	last: number,
}

const setup = {

	state: {
		/** CONNECTION d riferimento */
		connectionId: <string>null,

		/** SUBSCRIPTION sui quali rimanere in ascolto */
		subscriptions: <Subscription[]>null,
		/** DIALOG SUBSCRIPTION aperta */
		subscriptionsOpen: false,

		/** tutti i messaggi ricevuti */
		messages: <Message[]>[],
		//messages: <Message[]>historyTest,
		noSysMessages: true,

		/** contatore SUBJECTS ricevuti */
		stats: <{ [subjects: string]: MessageStat }>{},

		/** testo per la ricerca */
		textSearch: <string>null,

		/* per la dialog di FORMAT */
		format: MSG_FORMAT.JSON,
		formatsOpen: false,

		pause: false,

		//#region VIEWBASE
		colorVar: COLOR_VAR.CYAN,
		//#endregion
	},

	getters: {
		getConnection: (_: void, store?: MessagesStore) => {
			return cnnSo.getById(store.state.connectionId)
		},
		getSocketServiceId: (_: void, store?: MessagesStore) => `msg::${store.state.uuid}`,
		getFiltered: (_: void, store?: MessagesStore) => {
			const text = store.state.textSearch?.toLocaleLowerCase()?.trim()
			if (!text || text.length == 0 || !store.state.messages) return store.state.messages
			return store.state.messages.filter(message =>
				!!message.type
				|| message.payload.toLowerCase().includes(text)
				|| message.subject.toLowerCase().includes(text)
			)
		},

		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) => "MESSAGES",
		getSubTitle: (_: void, store?: ViewStore) => (<MessagesStore>store).getConnection()?.name ?? "--",
		getSerialization: (_: void, store?: ViewStore) => {
			const state = store.state as MessagesState
			return {
				...viewSetup.getters.getSerialization(null, store),
				connectionId: state.connectionId,
				subscriptions: state.subscriptions,
				textSearch: state.textSearch,
				format: state.format,
			}
		},
		//#endregion

	},

	actions: {

		async fetch(_: void, store?: MessagesStore) {
			const subscriptions = await messagesApi.subscriptionIndex(
				store.state.connectionId,
				{ store, manageAbort: true }
			)
			subscriptions.forEach(s => s.favorite = s.disabled = true)
			store.setSubscriptions(subscriptions)
		},
		async fetchIfVoid(_: void, store?: MessagesStore) {
			if (store.state.subscriptions == null) await store.fetch()
		},

		//#region VIEWBASE
		setSerialization: (data: any, store?: ViewStore) => {
			viewSetup.actions.setSerialization(data, store)
			const state = store.state as MessagesState
			state.connectionId = data.connectionId
			state.subscriptions = data.subscriptions
			state.textSearch = data.textSearch
			state.format = data.format
		},
		//#endregion


		connect(_: void, store?: MessagesStore) {
			console.log("CONNECT")
			const ss = socketPool.create(store.getSocketServiceId(), store.state.connectionId)
			ss.onOpen = () => store.sendSubscriptions()
			ss.onMessage = message => store.addMessage(message)
			// ss.onStatus = (payload: PayloadStatus) => {
			// 	cnnSo.update({ id: store.state.connectionId, status: payload.status })
			// }
		},
		disconnect(_: void, store?: MessagesStore) {
			console.log("DISCONNECT")
			socketPool.destroy(store.getSocketServiceId())
		},

		/** aggiungo un messaggio di questa CARD */
		addMessage(msg: PayloadMessage, store?: MessagesStore) {

			// eventualmente scarta i messaggi di sistema
			if (store.state.noSysMessages && (msg.subject.startsWith("_INBOX") || msg.subject.startsWith("$"))) return

			const message: Message = {
				subject: msg.subject,
				payload: msg.payload as string,
				receivedAt: Date.now(),
			}
			const i = store.state.messages.length > MaxMessagesLength ? 5000 : 0
			const msgs = store.state.messages.slice(i)
			msgs.push(message)
			store.setMessages(msgs)

			let sbjCounter = store.state.stats[msg.subject]
			if (!sbjCounter) {
				sbjCounter = { subject: msg.subject, counter: 0, last: 0 }
				store.state.stats[msg.subject] = sbjCounter
			}
			sbjCounter.counter++;
			sbjCounter.last = dayjs().valueOf()
		},
		/** aggiorno i subjects di questo stack messages */
		sendSubscriptions: (_: void, store?: MessagesStore) => {
			// invio il cambio di subs al web-socket
			const subjWS = store.state.pause
				? []
				: store.state.subscriptions
					?.filter(s => !!s?.subject && !s.disabled)
					.map(s => s.subject) ?? []
			socketPool.getById(store.getSocketServiceId())?.sendSubjects(subjWS)

			// messaggio in lista di cambio subs
			const msgChangeSubj: Message = {
				type: subjWS.length > 0 ? MESSAGE_TYPE.INFO : MESSAGE_TYPE.WARN,
				subject: store.state.pause ? "IN PAUSE" : subjWS.length > 0 ? "LISTENING ON SUBJECTS" : "NO SUBJECTS",
				payload: subjWS.join(", "),
				receivedAt: Date.now(),
			}
			store.setMessages([...store.state.messages, msgChangeSubj])
		},
		/** invio al REST nel caso ci siano nuovi preferiti */
		updateSubscriptions: (_: void, store?: MessagesStore) => {
			const subjRest = store.state.subscriptions
				?.filter(s => !!s?.subject && s.favorite)
				.map(s => ({ subject: s.subject })) ?? []
			messagesApi.subscriptionUpdate(store.state.connectionId, subjRest)
		},

		/** apertura CARD MESSAGE-DETAIL */
		openMessageDetail(message: Message, store?: MessagesStore) {
			const msgOld = (store.state.linked as MessageStore)?.state.message
			const view = msgOld == message ? null : buildMessageDetail(message, store.state.format)
			store.state.group.addLink({ view, parent: store, anim: !msgOld || !view })
		},
		/** apertura CARD MESSAGE-SEND */
		openMessageSend(_: void, store?: MessagesStore) {
			const cnn = store.getConnection()
			if (!cnn) return
			store.state.group.addLink({
				view: buildConnectionMessageSend(
					cnn.id,
					store.state.subscriptions.map(s => s.subject)
				),
				parent: store,
				anim: true,
			})
		},
	},

	mutators: {
		setSubscriptions: (subscriptions: Subscription[]) => ({ subscriptions }),
		setMessages: (messages: Message[]) => ({ messages }),
		setNoSysMessages: (noSysMessages: boolean) => ({ noSysMessages }),
		setSubscriptionsOpen: (subscriptionsOpen: boolean) => ({ subscriptionsOpen }),
		setTextSearch: (textSearch: string) => ({ textSearch }),
		setFormat: (format: MSG_FORMAT) => ({ format }),
		setFormatsOpen: (formatsOpen: boolean) => ({ formatsOpen }),
		setStats: (stats: { [subjects: string]: MessageStat }) => ({ stats }),
		setPause: (pause: boolean) => ({ pause }),
	},

	onListenerChange: (store: MessagesStore, type: LISTENER_CHANGE) => {
		if (store._listeners.size == 1 && type == LISTENER_CHANGE.ADD) {
			store.connect()
		} else if (store._listeners.size == 0) {
			store.disconnect()
		}
	}
}

export type MessagesState = typeof setup.state & ViewState
export type MessagesGetters = typeof setup.getters
export type MessagesActions = typeof setup.actions
export type MessagesMutators = typeof setup.mutators
export interface MessagesStore extends ViewStore, StoreCore<MessagesState>, MessagesGetters, MessagesActions, MessagesMutators {
	state: MessagesState
}
const msgSetup = mixStores(viewSetup, setup)
export default msgSetup


