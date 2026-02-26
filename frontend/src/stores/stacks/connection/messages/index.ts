import messagesApi from "@/api/messages"
import { socketPool } from "@/plugins/SocketService/pool"
import { MSG_TYPE, PayloadMessage, PayloadSubExpired } from "@/plugins/SocketService/types"
import cnnSo from "@/stores/connections"
import { buildMessageDetail } from "@/stores/docs/utils/factory"
import viewSetup, { ViewStore } from "@/stores/stacks/viewBase"
import { DOC_TYPE, Subscription } from "@/types"
import { MESSAGE_TYPE, Message } from "@/types/Message"
import { MSG_FORMAT } from "@/utils/editor"
import { debounce, throttle } from "@/utils/time"
import { LISTENER_CHANGE, mixStores } from "@priolo/jon"
import dayjs from "dayjs"
import { MessageStore } from "../../message"
import { ViewState } from "../../viewBase"
import { buildConnectionMessageSend } from "../utils/factory"
import { SS_EVENTS } from "@/plugins/SocketService"

// Default values for subscription cleanup
const DEFAULT_TTL_MINUTES = 15
const DEFAULT_MAX_MESSAGES = 1000

// Subscription history storage key
const SUBSCRIPTION_HISTORY_KEY = "nui_subscription_history"

export type SubscriptionHistoryEntry = {
	subject: string
	expiredAt: number
	reason: string
	connectionId: string
}

// Load subscription history from localStorage
function loadSubscriptionHistory(): SubscriptionHistoryEntry[] {
	try {
		const data = localStorage.getItem(SUBSCRIPTION_HISTORY_KEY)
		return data ? JSON.parse(data) : []
	} catch {
		return []
	}
}

// Save subscription history to localStorage
function saveSubscriptionHistory(history: SubscriptionHistoryEntry[]) {
	try {
		localStorage.setItem(SUBSCRIPTION_HISTORY_KEY, JSON.stringify(history))
	} catch {
		// Ignore storage errors
	}
}

// Add entry to subscription history
function addToSubscriptionHistory(entry: SubscriptionHistoryEntry) {
	const history = loadSubscriptionHistory()
	// Remove duplicates (same subject and connection)
	const filtered = history.filter(
		h => !(h.subject === entry.subject && h.connectionId === entry.connectionId)
	)
	// Add new entry at the beginning
	filtered.unshift(entry)
	// Keep only last 50 entries
	saveSubscriptionHistory(filtered.slice(0, 50))
}



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

		/** subscription history (expired subscriptions) */
		subscriptionHistory: <SubscriptionHistoryEntry[]>[],

		/** testo per la ricerca */
		textSearch: <string>null,

		/* per la dialog di FORMAT */
		format: MSG_FORMAT.JSON,
		formatsOpen: false,

		pause: false,

		/** internal: track if already connected to prevent duplicate sends on UI moves */
		_connected: false,

		//#region VIEWBASE
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


		async connect(_: void, store?: MessagesStore) {
			// Skip if already connected (prevent duplicate sends on UI moves)
			if (store.state._connected) {
				console.log("CONNECT - already connected, skipping")
				return
			}

			console.log("CONNECT")
			const ss = await socketPool.create(store.getSocketServiceId(), store.state.connectionId)
			if (!ss) return

			store.state._connected = true

			//ss.onOpen = () => store.sendSubscriptions()
			//ss.onMessage = message => store.addMessage(message)
			ss.emitter.on(MSG_TYPE.NATS_MESSAGE, msg => {
				const payload = msg.payload as PayloadMessage
				store.addMessage({
					headers: payload.headers,
					subject: payload.subject,
					payload: atob(payload.payload),
				})
			})
			// Handle subscription expiry notifications
			ss.emitter.on(MSG_TYPE.SUB_EXPIRED, msg => {
				const payload = msg as PayloadSubExpired
				store.handleSubscriptionExpired(payload)
			})
			// Don't send subscriptions on connect - only when user explicitly adds/modifies them
		},
		disconnect(_: void, store?: MessagesStore) {
			console.log("DISCONNECT")
			store.state._connected = false
			// Send disconnect request to server to immediately clean up subscriptions
			const ss = socketPool.getById(store.getSocketServiceId())
			if (ss) {
				ss.sendDisconnect()
			}
			socketPool.destroy(store.getSocketServiceId())
		},

		/** aggiungo un messaggio di questa CARD */
		addMessage(msg: PayloadMessage, store?: MessagesStore) {

			// eventualmente scarta i messaggi di sistema
			if (store.state.noSysMessages && (msg.subject.startsWith("_INBOX") || msg.subject.startsWith("$"))) return

			const message: Message = {
				headers: msg.headers,
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

			// se ho un link del dettaglio MESSAGE e questo vuole sempre l'ultimo allora lo cambio
			const linked = store.state.linked as MessageStore
			if ( !!linked && linked?.state.type == DOC_TYPE.MESSAGE && linked.state.linkToLast ) {
				throttle(`msg-last-${store.state.uuid}`, () => {
					const lastMessage = msgs[msgs.length - 1]
					linked.setMessage(lastMessage)
				}, 1000)
			}
		},
		/** Handle subscription expired event from backend */
		handleSubscriptionExpired: (payload: PayloadSubExpired, store?: MessagesStore) => {
			const reasonText = {
				ttl: "TTL expired",
				max_messages: "Max messages reached",
				disconnect: "Disconnected",
				limit: "Subscription limit exceeded"
			}[payload.reason] || payload.reason

			// Add expiry message to the message list
			const expiredMsg: Message = {
				type: MESSAGE_TYPE.WARN,
				subject: `SUBSCRIPTION EXPIRED: ${payload.subject || "all"}`,
				payload: reasonText,
				receivedAt: Date.now(),
			}
			store.setMessages([...store.state.messages, expiredMsg])

			// If a specific subject expired, mark it as disabled and add to history
			if (payload.subject) {
				const subs = store.state.subscriptions?.map(s =>
					s.subject === payload.subject ? { ...s, disabled: true } : s
				)
				if (subs) store.setSubscriptions(subs)

				// Add to history
				const historyEntry: SubscriptionHistoryEntry = {
					subject: payload.subject,
					expiredAt: Date.now(),
					reason: payload.reason,
					connectionId: store.state.connectionId,
				}
				addToSubscriptionHistory(historyEntry)
				store.loadSubscriptionHistory()
			}
		},

		/** Load subscription history from localStorage */
		loadSubscriptionHistory: (_: void, store?: MessagesStore) => {
			const history = loadSubscriptionHistory()
			// Filter to only show history for this connection
			const filtered = history.filter(h => h.connectionId === store.state.connectionId)
			store.setSubscriptionHistory(filtered)
		},

		/** Re-subscribe to a subject from history */
		resubscribeFromHistory: (subject: string, store?: MessagesStore) => {
			const subs = store.state.subscriptions || []
			// Check if already in subscriptions
			const existing = subs.find(s => s.subject === subject)
			if (existing) {
				// Re-enable it
				const updated = subs.map(s =>
					s.subject === subject ? { ...s, disabled: false } : s
				)
				store.setSubscriptions(updated)
			} else {
				// Add new subscription
				store.setSubscriptions([...subs, { subject, disabled: false, favorite: false }])
			}
			store.sendSubscriptions()
		},

		/** Clear subscription history for this connection */
		clearSubscriptionHistory: (_: void, store?: MessagesStore) => {
			const history = loadSubscriptionHistory()
			const filtered = history.filter(h => h.connectionId !== store.state.connectionId)
			saveSubscriptionHistory(filtered)
			store.setSubscriptionHistory([])
		},

		/** aggiorno i subjects di questo stack messages */
		sendSubscriptions: (_: void, store?: MessagesStore) => {
			// Get TTL and max messages from first active subscription (they share the same options)
			const activeSub = store.state.subscriptions?.find(s => !s.disabled)
			const ttlMinutes = activeSub?.ttlMinutes ?? DEFAULT_TTL_MINUTES
			const maxMessages = activeSub?.maxMessages ?? DEFAULT_MAX_MESSAGES
			const sessionBased = activeSub?.sessionBased ?? true

			// invio il cambio di subs al web-socket
			const subjWS = store.state.pause
				? []
				: store.state.subscriptions
					?.filter(s => !!s?.subject && !s.disabled)
					.map(s => s.subject) ?? []
			socketPool.getById(store.getSocketServiceId())?.sendSubjects(subjWS, { ttlMinutes, maxMessages, sessionBased })

			// Calculate expiry time
			const expiryTime = dayjs().add(ttlMinutes, 'minute').format('HH:mm:ss')
			const expiryInfo = subjWS.length > 0 ? ` (expires ${expiryTime}, max ${maxMessages} msgs)` : ''

			// messaggio in lista di cambio subs
			const msgChangeSubj: Message = {
				type: subjWS.length > 0 ? MESSAGE_TYPE.INFO : MESSAGE_TYPE.WARN,
				subject: store.state.pause ? "IN PAUSE" : subjWS.length > 0 ? `LISTENING ON SUBJECTS${expiryInfo}` : "NO SUBJECTS",
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
			const storeMsg = (store.state.linked as MessageStore)

			// se è gia' aperto il dettaglio del messaggio 
			if (storeMsg?.state.type == DOC_TYPE.MESSAGE) {
				// se è uguale a quello precedente allora lo chiudo
				if (storeMsg.state.message == message) {
					store.state.group.addLink({ view: null, parent: store, anim: true })
				} else {
					const msgSo: MessageStore = store.state.linked as MessageStore
					msgSo.setMessage(message)
				}
			// se invece è chiuso...
			} else {
				const view = buildMessageDetail(message, store.state.format, storeMsg?.state.autoFormat ?? false)
				store.state.group.addLink({ view, parent: store, anim: true })
			}
			store._update()

			// tolgo l'aggancio all'ultimo messaggio
			if ( store.state.linked?.state.type == DOC_TYPE.MESSAGE ) {
				(<MessageStore>store.state.linked).state.linkToLast = false
			}
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
		setSubscriptionHistory: (subscriptionHistory: SubscriptionHistoryEntry[]) => ({ subscriptionHistory }),
	},

	onListenerChange: (store: MessagesStore, type: LISTENER_CHANGE) => {
		const debounceKey = `msg-listener::${store.state.uuid}`
		if (store._listeners.size == 1 && type == LISTENER_CHANGE.ADD) {
			// Cancel any pending disconnect (e.g., from window move)
			debounce(debounceKey)
			store.connect()
			store.loadSubscriptionHistory()
		} else if (store._listeners.size == 0) {
			// Debounce disconnect to handle window move (unmount/remount)
			debounce(debounceKey, () => store.disconnect(), 200)
		}
	}
}

export type MessagesState = typeof setup.state & ViewState
export type MessagesGetters = typeof setup.getters
export type MessagesActions = typeof setup.actions
export type MessagesMutators = typeof setup.mutators
export interface MessagesStore extends ViewStore, MessagesGetters, MessagesActions, MessagesMutators {
	state: MessagesState
}
const msgSetup = mixStores(viewSetup, setup)
export default msgSetup


