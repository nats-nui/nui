import messagesApi from "@/api/messages"
import cnnSo from "@/stores/connections"
import { COLOR_VAR } from "@/stores/layout"
import viewSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { StoreCore, mixStores } from "@priolo/jon"
import editorSetup, { EditorState, EditorStore } from "../../editorBase"
import { LOAD_STATE } from "../../utils"
import { MESSAGE_TYPE } from "@/stores/log/utils"



const setup = {

	state: {
		connectionId: <string>null,
		text: <string>null,
		subject: <string>null,
		subjects: <string[]>[],
		subsOpen: false,

		loadingState: LOAD_STATE.IDLE,

		//#region VIEWBASE
		colorVar: COLOR_VAR.CYAN,
		width: 420,
		//#endregion
	},

	getters: {

		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) => "SEND MESSAGE",
		getSubTitle: (_: void, store?: ViewStore) => {
			const cnnId = (store.state as MessageSendState).connectionId
			const cnn = cnnSo.getById(cnnId)
			return cnn?.name ?? "--"
		},
		getSerialization: (_: void, store?: ViewStore) => {
			const state = store.state as MessageSendState
			return {
				...viewSetup.getters.getSerialization(null, store),
				connectionId: state.connectionId,
				text: state.text,
				subject: state.subject,
				subjects : state.subjects,
			}
		},
		//#endregion

		getEditorText: (_: void, store?: ViewStore) => (<MessageSendStore>store).state.text ?? "",

		getCanEdit: (_: void, store?: MessageSendStore) => store.state.subject?.length > 0 && store.state.text?.length > 0 && store.state.loadingState != LOAD_STATE.LOADING,
	},

	actions: {

		//#region VIEWBASE
		setSerialization: (data: any, store?: ViewStore) => {
			viewSetup.actions.setSerialization(data, store)
			const state = store.state as MessageSendState
			state.connectionId = data.connectionId
			state.text = data.text
			state.subject = data.subject
			state.subjects = data.subjects
		},
		//#endregion

		publish: async (_: void, store?: MessageSendStore) => {
			try {
				await messagesApi.publish(
					store.state.connectionId,
					store.state.subject,
					store.state.text,
					{ store }
				)
				store.setSnackbar({ open: true,
					type: MESSAGE_TYPE.INFO,
					title: "MESSAGE SENT",
					body: "Your message has been sent correctly",
					timeout: 2000,
				})
			} catch (e) { }
		},

	},

	mutators: {
		setText: (text: string, store?: MessageSendStore) => ({ text }),
		setSubject: (subject: string) => ({ subject }),
		setSubsOpen: (subsOpen: boolean) => ({ subsOpen }),

		setLoadingState: (loadingState: LOAD_STATE) => ({ loadingState }),
	},
}

export type MessageSendState = typeof setup.state & ViewState & EditorState
export type MessageSendGetters = typeof setup.getters
export type MessageSendActions = typeof setup.actions
export type MessageSendMutators = typeof setup.mutators
export interface MessageSendStore extends ViewStore, EditorStore, StoreCore<MessageSendState>, MessageSendGetters, MessageSendActions, MessageSendMutators {
	state: MessageSendState
}
const msgSetup = mixStores(viewSetup, editorSetup, setup)
export default msgSetup
