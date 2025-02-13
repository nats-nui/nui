import viewSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { Message } from "@/types/Message"
import { mixStores } from "@priolo/jon"
import { MSG_FORMAT } from "../../../utils/editor"
import { binaryStringToString } from "../../../utils/string"
import editorSetup, { EditorState, EditorStore } from "../editorBase"



const setup = {

	state: {
		message: <Message>null,

		//#region VIEWBASE
		width: 420,
		widthMax: 1000,
		//#endregion

		/* voglio vedere sepre l'ultimo messaggio arrivato*/
		linkToLast: false,
	},

	getters: {

		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) => "MESSAGE DETAIL",
		getSubTitle: (_: void, store?: ViewStore): string => (store as MessageStore).state.message?.subject ?? "--",
		// 	const timestamp = (store as MessageStore).state.message?.receivedAt
		// 	return !!timestamp ? dayjs(timestamp).format("YYYY-MM-DD HH:mm:ss") : ""
		// },
		getSerialization: (_: void, store?: ViewStore) => {
			const state = store.state as MessageState
			return {
				...viewSetup.getters.getSerialization(null, store),
				message: state.message,
				format: state.format,
			}
		},
		//#endregion

		getEditorText: (_: void, store?: ViewStore) => {
			const msgSo = <MessageStore>store
			const payload = msgSo.state.message?.payload ?? ""
			const format = msgSo.state.format
			if (format != MSG_FORMAT.BASE64 && format != MSG_FORMAT.HEX) {
				return binaryStringToString(payload)
			}
			return payload
		}
	},

	actions: {

		//#region VIEWBASE
		setSerialization: (data: any, store?: ViewStore) => {
			viewSetup.actions.setSerialization(data, store)
			const state = store.state as MessageState
			state.message = data.message
			state.format = data.format
		},
		//#endregion

	},

	mutators: {
		setLinkToLast: (linkToLast: boolean) => ({ linkToLast }),
		setMessage: (message: Message) => ({ message }),
	},
}

export type MessageState = typeof setup.state & ViewState & EditorState
export type MessageGetters = typeof setup.getters
export type MessageActions = typeof setup.actions
export type MessageMutators = typeof setup.mutators
export interface MessageStore extends ViewStore, EditorStore, MessageGetters, MessageActions, MessageMutators {
	state: MessageState
}
const msgSetup = mixStores(viewSetup, editorSetup, setup)
export default msgSetup


