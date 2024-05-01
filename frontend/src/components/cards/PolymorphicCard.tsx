import CnnDetailView from "@/components/stacks/connections/detail/View"
import MessagesView from "@/components/stacks/connections/messages/View"
import { CnnDetailStore } from "@/stores/stacks/connection/detail"
import { CnnListStore } from "@/stores/stacks/connection"
import { ConsumersStore } from "@/stores/stacks/consumer"
import { ConsumerStore } from "@/stores/stacks/consumer/detail"
import { ViewLogStore } from "@/stores/stacks/log"
import { MessageStore } from "@/stores/stacks/message"
import { MessagesStore } from "@/stores/stacks/connection/messages"
import { MessageSendStore } from "@/stores/stacks/connection/messageSend"
import { StreamsStore } from "@/stores/stacks/streams"
import { StreamStore } from "@/stores/stacks/streams/detail"
import { ViewStore } from "@/stores/stacks/viewBase"
import { DOC_TYPE } from "@/types"
import { FunctionComponent, useMemo } from "react"
import CnnListView from "../stacks/connections/ListView"
import ConsumersListView from "../stacks/consumers/ListView"
import ConsumerDetailView from "../stacks/consumers/detail/View"
import LogsView from "../stacks/mainLogs/View"
import AboutView from "../stacks/about/View"
import TextEditorView from "../stacks/editor/View"
import MessageView from "../stacks/message/View"
import MessageSendView from "../stacks/messageSend/View"
import StreamsListView from "../stacks/streams/list/ListView"
import StreamDetailView from "../stacks/streams/detail/View"
import StreamMessagesView from "../stacks/streams/messages/View"
import { StreamMessagesStore } from "@/stores/stacks/streams/messages"
import BucketsListView from "../stacks/buckets/list/ListView"
import BucketDetailView from "../stacks/buckets/detail/View"
import { BucketStore } from "@/stores/stacks/buckets/detail"
import { BucketsStore } from "@/stores/stacks/buckets"
import KVEntryListView from "../stacks/kventries/list/ListView"
import { KVEntriesStore } from "@/stores/stacks/kventry"
import KvEntryDetailView from "../stacks/kventries/detail/View"
import { KVEntryStore } from "@/stores/stacks/kventry/detail"
import { AboutStore } from "@/stores/stacks/about"
import { TextEditorStore } from "@/stores/stacks/editor"



interface DocCmpProps {
	view: ViewStore,
}

/** Seleziona il contenuto da visualizzare in base al tipo di VIEW */
const PolymorphicCard: FunctionComponent<DocCmpProps> = ({
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
			case DOC_TYPE.STREAM_MESSAGES:
				return <StreamMessagesView store={view as StreamMessagesStore} />

			case DOC_TYPE.CONSUMERS:
				return <ConsumersListView store={view as ConsumersStore} />
			case DOC_TYPE.CONSUMER:
				return <ConsumerDetailView store={view as ConsumerStore} />

			case DOC_TYPE.BUCKETS:
				return <BucketsListView store={view as BucketsStore} />
			case DOC_TYPE.BUCKET:
				return <BucketDetailView store={view as BucketStore} />
			case DOC_TYPE.KVENTRIES:
				return <KVEntryListView store={view as KVEntriesStore} />
			case DOC_TYPE.KVENTRY:
				return <KvEntryDetailView store={view as KVEntryStore} />

			case DOC_TYPE.LOGS:
				return <LogsView store={view as ViewLogStore} />
			case DOC_TYPE.ABOUT:
				return <AboutView store={view as AboutStore} />
			case DOC_TYPE.TEXT_EDITOR:
				return <TextEditorView store={view as TextEditorStore} />

			default:
				return null
		}
	}, [view])
	return content
}

export default PolymorphicCard