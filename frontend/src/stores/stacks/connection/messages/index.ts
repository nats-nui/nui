import { socketPool } from "@/plugins/SocketService/pool"
import { PayloadMessage, PayloadStatus } from "@/plugins/SocketService/types"
import cnnSo from "@/stores/connections"
import docsSo from "@/stores/docs"
import { buildMessageDetail, buildStore } from "@/stores/docs/utils/factory"
import { COLOR_VAR } from "@/stores/layout"
import viewSetup, { ViewStore } from "@/stores/stacks/viewBase"
import { CNN_STATUS, DOC_TYPE, Subscription } from "@/types"
import { MESSAGE_TYPE, Message } from "@/types/Message"
import { LISTENER_CHANGE, StoreCore, mixStores } from "@priolo/jon"
import { MessageSendState } from "../messageSend"
import { ViewState } from "../../viewBase"
import { MSG_FORMAT } from "@/utils/editor"
import historyTest from "./_test"



const setup = {

	state: {
		connectionId: <string>null,
		/** SUBS sui quali rimanere in ascolto */
		subscriptions: <Subscription[]>[],
		lastSubjects: <string[]>null,
		/** tutti i messaggi ricevuti */
		messages: <Message[]>[],
		//messages: <Message[]>historyTest,
		/** testo per la ricerca */
		textSearch: <string>null,
		/** DIALOG SUBS aperta */
		subscriptionsOpen: false,

		/* per la dialog di FORMAT */
		format: MSG_FORMAT.JSON,
		formatsOpen: false,

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
			if (!text || text.length == 0) return store.state.messages
			return store.state.messages.filter(message =>
				message.seqNum == MESSAGE_TYPE.SUBJECT_CHANGE
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
			ss.onOpen = () => {
				store.sendSubscriptions()
				cnnSo.update({ id: store.state.connectionId, status: CNN_STATUS.CONNECTED })
			}
			ss.onMessage = message => store.addMessage(message)
			ss.onStatus = (payload: PayloadStatus) => {
				cnnSo.update({ id: store.state.connectionId, status: payload.status })
			}
		},
		disconnect(_: void, store?: MessagesStore) {
			console.log("DISCONNECT")
			socketPool.destroy(store.getSocketServiceId())
		},

		/** aggiungo un messaggio di questa CARD */
		addMessage(msg: PayloadMessage, store?: MessagesStore) {
			const message: Message = {
				subject: msg.subject,
				payload: msg.payload as string,
				receivedAt: Date.now(),
			}
			store.setMessages([...store.state.messages, message])
		},
		/** aggiorno i subjects di questo stack messages */
		sendSubscriptions: (_: void, store?: MessagesStore) => {
			const subjects = store.state.subscriptions
				?.filter(s => !!s?.subject && !s.disabled)
				.map(s => s.subject) ?? []
			if (store.state.lastSubjects && store.state.lastSubjects.length == subjects.length && subjects.every(s => store.state.lastSubjects.includes(s))) return
			socketPool.getById(store.getSocketServiceId())?.sendSubjects(subjects)
			store.state.lastSubjects = subjects

			const msgChangeSubj: Message = {
				seqNum: MESSAGE_TYPE.SUBJECT_CHANGE,
				subject: "LISTENING ON SUBJECTS",
				payload: subjects.join(", "),
				receivedAt: Date.now(),
			}
			store.setMessages([...store.state.messages, msgChangeSubj])
		},
		/** apertura CARD MESSAGE-DETAIL */
		openMessageDetail(message: Message, store?: MessagesStore) {
			docsSo.addLink({
				view: buildMessageDetail(message, store.state.format),
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
		setMessages: (messages: Message[]) => ({ messages }),
		setSubscriptionsOpen: (subscriptionsOpen: boolean) => ({ subscriptionsOpen }),
		setTextSearch: (textSearch: string) => ({ textSearch }),
		setFormat: (format: MSG_FORMAT) => ({ format }),
		setFormatsOpen: (formatsOpen: boolean) => ({ formatsOpen }),
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


