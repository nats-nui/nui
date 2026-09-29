import messagesApi from "@/api/messages"
import { buildMessageDetail } from "@/stores/docs/utils/factory"
import { MESSAGE_TYPE } from "@/stores/log/utils"
import viewSetup, { ViewStore } from "@/stores/stacks/viewBase"
import { About } from "@/types/About"
import { Message } from "@/types/Message"
import { mixStores, StoreOf } from "@priolo/jon"
import { MSG_FORMAT, toPayload } from "../../../utils/editor"
import { binaryStringToString } from "../../../utils/string"
import editorSetup from "../editorBase"
import { MessageStore } from "../message"
import { LOAD_STATE } from "../utils"



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

		getCanSend: (_: void, store?: SyncStore) => store.state.subject?.length > 0 && store.state.loadingState != LOAD_STATE.LOADING,
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
			const { payload, error } = toPayload(store.state.messageSend, store.state.format)
			if (error) {
				store.setSnackbar({
					open: true,
					type: MESSAGE_TYPE.ERROR,
					title: "MESSAGE NOT SENT",
					body: error,
					timeout: 4000,
				})
				return
			}
			try {
				const resp = await messagesApi.sync(
					store.state.connectionId,
					store.state.subject,
					payload,
					store.state.headers,
					store.state.timeoutMs,
					{ store }
				)
				// a CBOR reply is binary: decoding it as UTF-8 text would corrupt it
				store.setMessageReceived(store.state.format == MSG_FORMAT.CBOR
					? resp.payload
					: binaryStringToString(resp.payload)
				)
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
			const view = msgOld?.payload==message?.payload ? null : buildMessageDetail(message, store.state.format, storeMsg?.state.autoFormat ?? false)
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

const syncSetup = mixStores(viewSetup, editorSetup, setup)
export interface SyncStore extends StoreOf<typeof syncSetup> {}
export type SyncState = SyncStore["state"]
export default syncSetup
