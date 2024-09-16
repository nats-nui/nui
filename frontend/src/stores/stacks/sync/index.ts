import messagesApi from "@/api/messages"
import { buildMessageDetail } from "@/stores/docs/utils/factory"
import { MESSAGE_TYPE } from "@/stores/log/utils"
import viewSetup, { ViewStore } from "@/stores/stacks/viewBase"
import { About } from "@/types/About"
import { Message } from "@/types/Message"
import { StoreCore, mixStores } from "@priolo/jon"
import editorSetup, { EditorState, EditorStore } from "../editorBase"
import { MessageStore } from "../message"
import { LOAD_STATE } from "../utils"
import { ViewState } from "../viewBase"



const setup = {

	state: {
		connectionId: <string>null,
		subject: "",
		messageSend: "",
		timeoutMs: 2000,
		headers: <[string, string][]>[],

		messageReceived: "",
		headersReceived: {},

		optionsOpen: false,

		loadingState: LOAD_STATE.IDLE,

		//#region VIEWBASE
		width: 420,
		//#endregion
	},

	getters: {
		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) => "REQUEST / REPLY",
		getSubTitle: (_: void, store?: ViewStore) => "Send a message synchronously",
		getSerialization: (_: void, store?: ViewStore) => {
			const state = store.state as SyncState
			return {
				...viewSetup.getters.getSerialization(null, store),
				connectionId: state.connectionId,
				messageReceived: state.messageReceived,
				messageSend: state.messageSend,
				subject: state.subject,
				headers: state.headers,

			}
		},
		//#endregion

		getCanSend: (_: void, store?: SyncStore) => store.state.subject?.length > 0 && store.state.messageSend?.length > 0 && store.state.loadingState != LOAD_STATE.LOADING,
	},

	actions: {

		//#region VIEWBASE
		setSerialization: (data: any, store?: ViewStore) => {
			viewSetup.actions.setSerialization(data, store)
			const state = store.state as SyncState
			state.connectionId = data.connectionId
			state.messageReceived = data.messageReceived
			state.messageSend = data.messageSend
			state.subject = data.subject
			state.headers = data.headers
		},
		//#endregion

		send: async (_: void, store?: SyncStore) => {
			try {
				const resp = await messagesApi.sync(
					store.state.connectionId,
					store.state.subject,
					store.state.messageSend,
					store.state.headers,
					store.state.timeoutMs,
					{ store }
				)
				store.setMessageReceived(resp.payload)
				store.setHeadersReceived(resp.headers)
				store.setSnackbar({
					open: true,
					type: MESSAGE_TYPE.INFO,
					title: "MESSAGE SENT",
					body: "Your message has been sent correctly",
					timeout: 2000,
				})
			} catch (e) { }
		},

		/** apertura CARD MESSAGE-DETAIL */
		openMessageDetail(message: Message, store?: SyncStore) {
			const storeMsg = (store.state.linked as MessageStore)
			const msgOld = storeMsg?.state.message
			const view = msgOld?.payload==message?.payload ? null : buildMessageDetail(message, store.state.format, storeMsg?.state.autoFormat)
			store.state.group.addLink({ view, parent: store, anim: true })
		},
	},

	mutators: {
		setAbout: (about: About) => ({ about }),
		setMessageReceived: (messageReceived: string) => ({ messageReceived }),
		setHeadersReceived: (headersReceived: { [key: string]: string[] }) => ({ headersReceived }),
		setMessageSend: (messageSend: string) => ({ messageSend }),
		setSubject: (subject: string) => ({ subject }),
		setHeaders: (headers: [string,string][]) => ({ headers }),
		setTimeoutMs: (timeoutMs) => ({ timeoutMs }),
		setOptionsOpen: (optionsOpen: boolean) => ({ optionsOpen }),

	},
}

export type SyncState = typeof setup.state & ViewState & EditorState
export type SyncGetters = typeof setup.getters
export type SyncActions = typeof setup.actions
export type SyncMutators = typeof setup.mutators
export interface SyncStore extends ViewStore, EditorStore, StoreCore<SyncState>, SyncGetters, SyncActions, SyncMutators {
	state: SyncState
}
const syncSetup = mixStores(viewSetup, editorSetup, setup)
export default syncSetup
