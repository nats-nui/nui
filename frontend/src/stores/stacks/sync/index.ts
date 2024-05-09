import { COLOR_VAR } from "@/stores/layout"
import viewSetup, { ViewStore } from "@/stores/stacks/viewBase"
import { About } from "@/types/About"
import { StoreCore, mixStores } from "@priolo/jon"
import { ViewState } from "../viewBase"
import messagesApi from "@/api/messages"
import { MESSAGE_TYPE } from "@/stores/log/utils"
import editorSetup, { EditorState, EditorStore } from "../editorBase"
import { LOAD_STATE } from "../utils"



const setup = {

	state: {
		connectionId: <string>null,
		messageReceived: "",
		messageSend: "",
		subject: "",

		loadingState: LOAD_STATE.IDLE,

		//#region VIEWBASE
		colorVar: COLOR_VAR.CYAN,
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
		},
		//#endregion

		send: async (_: void, store?: SyncStore) => {
			try {
				const resp = await messagesApi.sync(
					store.state.connectionId,
					store.state.subject,
					store.state.messageSend,
					null,
					{ store }
				)
				store.setMessageReceived(resp.payload)
				store.setSnackbar({
					open: true,
					type: MESSAGE_TYPE.INFO,
					title: "MESSAGE SENT",
					body: "Your message has been sent correctly",
					timeout: 2000,
				})
			} catch (e) { }
		},
	},

	mutators: {
		setAbout: (about: About) => ({ about }),
		setMessageReceived: (messageReceived: string) => ({ messageReceived }),
		setMessageSend: (messageSend: string) => ({ messageSend }),
		setSubject: (subject: string) => ({ subject }),
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
