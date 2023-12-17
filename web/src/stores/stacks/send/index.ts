import docSetup, { ViewState, ViewStore } from "@/stores/docs/viewBase"
import { StoreCore, mixStores } from "@priolo/jon"
import cnnApi from "@/api/connection"
import cnnSo from "@/stores/connections"
import srcIcon from "@/assets/mg-hdr.svg"


const setup = {

	state: {
		connectionId: <string>null,
		text: <string>null,
		subject: <string>null,
		subsOpen: false,
	},

	getters: {
		getTitle: (_: void, store?: ViewStore) => {
			const cnnId = (store.state as MessageSendState).connectionId
			const cnn = cnnSo.getById(cnnId)
			return `TO ${cnn?.name ?? "..."}`
		},
		getSubTitle: (_: void, store?: ViewStore) => {
			const subject = (store as MessageSendStore).state.subject
			return subject ? `SUBJECT: ${subject}` : "NO SUBJECT!"
		},
		getIcon: (_: void, store?: ViewStore) => srcIcon,
	},

	actions: {
		publish: (_: void, store?: MessageSendStore) => {
			cnnApi.publish(
				store.state.connectionId, 
				store.state.subject, 
				store.state.text
			)
		},

	},

	mutators: {
		setText: (text: string, store?: MessageSendStore) => ({ text }),
		setSubject: (subject: string) => ({ subject }),
		setSubsOpen: (subsOpen: boolean) => ({ subsOpen }),
	},
}

export type MessageSendState = typeof setup.state & ViewState
export type MessageSendGetters = typeof setup.getters
export type MessageSendActions = typeof setup.actions
export type MessageSendMutators = typeof setup.mutators
export interface MessageSendStore extends ViewStore, StoreCore<MessageSendState>, MessageSendGetters, MessageSendActions, MessageSendMutators {
	state: MessageSendState
}
const msgSetup = mixStores(docSetup, setup)
export default msgSetup
