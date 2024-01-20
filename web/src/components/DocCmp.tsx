import CnnDetailView from "@/components/stacks/connections/CnnDetailView"
import MessagesView from "@/components/stacks/messages/MessagesView"
import { CnnDetailStore } from "@/stores/stacks/connection/detail"
import { CnnListStore } from "@/stores/stacks/connection/list"
import { MessageStore } from "@/stores/stacks/message"
import { MessagesStore } from "@/stores/stacks/messages"
import { MessageSendStore } from "@/stores/stacks/send"
import { StreamsStore } from "@/stores/stacks/streams"
import { StreamStore } from "@/stores/stacks/streams/detail"
import { ViewStore } from "@/stores/stacks/viewBase"
import { DOC_TYPE } from "@/types"
import { FunctionComponent, useMemo } from "react"
import CnnListView from "./stacks/connections/CnnListView"
import MessageView from "./stacks/message/MessageView"
import MessageSendView from "./stacks/messageSend/MessageSendView"
import StreamDetailView from "./stacks/streams/StreamDetailView"
import StreamsListView from "./stacks/streams/StreamsListView"
import LogsView from "./stacks/mainLogs/LogsView"
import { LogsStore } from "@/stores/stacks/mainLogs"



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
			case DOC_TYPE.CONNECTION:
				return <CnnDetailView store={view as CnnDetailStore} />
			case DOC_TYPE.MESSAGES:
				return <MessagesView store={view as MessagesStore} />
			case DOC_TYPE.MESSAGE:
				return <MessageView store={view as MessageStore} />
			case DOC_TYPE.MESSAGE_SEND:
				return <MessageSendView store={view as MessageSendStore} />
			case DOC_TYPE.STREAMS:
				return <StreamsListView store={view as StreamsStore} />
			case DOC_TYPE.STREAM:
				return <StreamDetailView store={view as StreamStore} />
			case DOC_TYPE.LOGS:
					return <LogsView store={view as LogsStore} />
			default:
				return null
		}
	}, [view])
	return content
}

export default DocCmp