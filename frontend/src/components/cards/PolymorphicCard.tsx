import CnnDetailView from "@/components/stacks/connections/detail/View"
import MessagesView from "@/components/stacks/connections/messages/View"
import { AboutStore } from "@/stores/stacks/about"
import { BucketsStore } from "@/stores/stacks/buckets"
import { BucketStore } from "@/stores/stacks/buckets/detail"
import { CnnListStore } from "@/stores/stacks/connection"
import { CnnDetailStore } from "@/stores/stacks/connection/detail"
import { MessageSendStore } from "@/stores/stacks/connection/messageSend"
import { MessagesStore } from "@/stores/stacks/connection/messages"
import { ConsumersStore } from "@/stores/stacks/consumer"
import { ConsumerStore } from "@/stores/stacks/consumer/detail"
import { HelpStore } from "@/stores/stacks/help"
import { KVEntriesStore } from "@/stores/stacks/kventry"
import { KVEntryStore } from "@/stores/stacks/kventry/detail"
import { ViewLogStore } from "@/stores/stacks/log"
import { MessageStore } from "@/stores/stacks/message"
import { StreamsStore } from "@/stores/stacks/streams"
import { StreamStore } from "@/stores/stacks/streams/detail"
import { StreamMessagesStore } from "@/stores/stacks/streams/messages"
import { SyncStore } from "@/stores/stacks/sync"
import { ViewStore } from "@/stores/stacks/viewBase"
import { DOC_TYPE } from "@/types"
import { FunctionComponent, useMemo } from "react"
import AboutView from "../stacks/about/View"
import ShortcutView from "../stacks/shortcut/View"
import BucketDetailView from "../stacks/buckets/detail/View"
import BucketsListView from "../stacks/buckets/list/ListView"
import CnnListView from "../stacks/connections/ListView"
import ConsumersListView from "../stacks/consumers/ListView"
import ConsumerDetailView from "../stacks/consumers/detail/View"
import HelpView from "../stacks/help/View"
import KvEntryDetailView from "../stacks/kventries/detail/View"
import KVEntryListView from "../stacks/kventries/list/ListView"
import LogsView from "../stacks/mainLogs/View"
import MessageView from "../stacks/message/View"
import MessageSendView from "../stacks/messageSend/View"
import StreamDetailView from "../stacks/streams/detail/View"
import StreamsListView from "../stacks/streams/list/ListView"
import StreamMessagesView from "../stacks/streams/messages/View"
import SyncView from "../stacks/sync/View"
import JsonConfigView from "../stacks/jsonconfig/View"
import { JsonConfigStore } from "../../stores/stacks/jsonconfig"
import { CnnImportStore } from "../../stores/stacks/cnnImport"
import CnnLoaderView from "../stacks/cnnImport/View"
import { ShortcutStore } from "../../stores/stacks/shortcut"
import CnnMetricsView from "../stacks/connections/metrics/View"
import { CnnMetricsStore } from "@/stores/stacks/connection/metrics"
import ClientMetricsView from "../stacks/connections/clients/View"
import { ClientMetricsStore } from "@/stores/stacks/connection/clients"



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
			case DOC_TYPE.CNN_LOADER:
				return <CnnLoaderView store={view as CnnImportStore} />
			case DOC_TYPE.CNN_METRICS:
				return <CnnMetricsView store={view as CnnMetricsStore} />
			case DOC_TYPE.CLIENT_METRICS:
				return <ClientMetricsView store={view as ClientMetricsStore} />

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
			case DOC_TYPE.HELP:
				return <HelpView store={view as HelpStore} />
			case DOC_TYPE.SYNC:
				return <SyncView store={view as SyncStore} />
			case DOC_TYPE.JSON_CONFIG:
				return <JsonConfigView store={view as JsonConfigStore} />
			case DOC_TYPE.SHORTCUT:
				return <ShortcutView store={view as ShortcutStore} />

			default:
				return null
		}
	}, [view])
	return content
}

export default PolymorphicCard