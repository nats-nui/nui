import MessagesView from "@/components/stacks/messages/MessagesView"
import CnnDetailView from "@/components/stacks/connections/CnnDetailView"
import { ViewStore } from "@/stores/docs/viewBase"
import { CnnListStore } from "@/stores/stacks/connection/list"
import { MessagesStore } from "@/stores/stacks/messages"
import { CnnDetailStore } from "@/stores/stacks/connection/detail"
import { DOC_TYPE } from "@/types"
import { FunctionComponent, useMemo } from "react"
import CnnListView from "./stacks/connections/CnnListView"
import { MessageStore } from "@/stores/stacks/message"
import MessageView from "./stacks/message/MessageView"
import MessageSendView from "./stacks/messageSend/MessageSendView"
import { MessageSendStore } from "@/stores/stacks/send"



interface DocCmpProps {
	view: ViewStore,
}

/** Seleziona il contenuto da visualizzare in base al tipo di VIEW */
const DocCmp: FunctionComponent<DocCmpProps> = ({
	view,
}) => {
	const content = useMemo(() => {
		switch (view.state.type) {
			case DOC_TYPE.CONNECTIONS:
				return <CnnListView store={view as CnnListStore} />
			case DOC_TYPE.SERVICES:
				return <CnnDetailView store={view as CnnDetailStore} />
			case DOC_TYPE.MESSAGES:
				return <MessagesView store={view as MessagesStore} />
			case DOC_TYPE.MESSAGE:
				return <MessageView store={view as MessageStore} />
			case DOC_TYPE.MESSAGE_SEND:
				return <MessageSendView store={view as MessageSendStore} />
			default:
				return null
		}
	}, [view])
	return content
}

export default DocCmp