import LogIcon from "@/icons/LogIcon"
import SyncIcon from "@/icons/SyncIcon"
import BucketIcon from "@/icons/cards/BucketIcon"
import BucketsIcon from "@/icons/cards/BucketsIcon"
import ConnectionIcon from "@/icons/cards/ConnectionIcon"
import ConnectionsIcon from "@/icons/cards/ConnectionsIcon"
import ConsumerIcon from "@/icons/cards/ConsumerIcon"
import ConsumersIcon from "@/icons/cards/ConsumersIcon"
import KvEntriesIcon from "@/icons/cards/KvEntriesIcon"
import KvEntryIcon from "@/icons/cards/KvEntryIcon"
import MessageIcon from "@/icons/cards/MessageIcon"
import MessagesIcon from "@/icons/cards/MessagesIcon"
import StreamIcon from "@/icons/cards/StreamIcon"
import StreamsIcon from "@/icons/cards/StreamsIcon"
import { DOC_TYPE } from "@/types"
import { FunctionComponent } from "react"
import ConfigIcon from "../../icons/cards/ConfigIcon"
import MetricsIcon from "@/icons/cards/MetricsIcon"



interface Props {
	type: DOC_TYPE,
	className?: string,
	style?: React.CSSProperties,
}

/** restituisce l'icona per un certo TYPE di CARD */
const CardIcon: FunctionComponent<Props> = ({
	type,
	className,
	style,
}) => {
	switch (type) {

		case DOC_TYPE.CONNECTIONS:
			return <ConnectionsIcon className={className} style={style} />
		case DOC_TYPE.CONNECTION:
			return <ConnectionIcon className={className} style={style} />
		case DOC_TYPE.CNN_METRICS:
			return <MetricsIcon className={className} style={style} />
		case DOC_TYPE.CLIENT_METRICS:
			return <MetricsIcon className={className} style={style} />

		case DOC_TYPE.CNN_LOADER:
			return <ConnectionIcon className={className} style={style} />

		case DOC_TYPE.MESSAGES:
			return <MessagesIcon className={className} style={style} />
		case DOC_TYPE.MESSAGE:
			return <MessageIcon className={className} style={style} />
		case DOC_TYPE.MESSAGE_SEND:

		case DOC_TYPE.STREAMS:
			return <StreamsIcon className={className} style={style} />
		case DOC_TYPE.STREAM:
			return <StreamIcon className={className} style={style} />
		case DOC_TYPE.STREAM_MESSAGES:
			return <MessagesIcon className={className} style={style} />

		case DOC_TYPE.CONSUMERS:
			return <ConsumersIcon className={className} style={style} />
		case DOC_TYPE.CONSUMER:
			return <ConsumerIcon className={className} style={style} />

		case DOC_TYPE.BUCKETS:
			return <BucketsIcon className={className} style={style} />
		case DOC_TYPE.BUCKET:
			return <BucketIcon className={className} style={style} />
		case DOC_TYPE.KVENTRIES:
			return <KvEntriesIcon className={className} style={style} />
		case DOC_TYPE.KVENTRY:
			return <KvEntryIcon className={className} style={style} />

		case DOC_TYPE.LOGS:
			return <LogIcon className={className} style={style} />
		case DOC_TYPE.ABOUT:
			return <div className={className} style={{ fontSize: 16, fontWeight: 700 }}>?</div>
		case DOC_TYPE.MESSAGE:
			return <MessageIcon className={className} style={style} />

		case DOC_TYPE.SYNC:
			return <SyncIcon className={className} style={style} />
		case DOC_TYPE.JSON_CONFIG:
			return <ConfigIcon className={className} style={style} />
		case DOC_TYPE.SHORTCUT:
			return <div className={className} style={{ fontSize: 16, fontWeight: 700 }}>?</div>

		default:
			return null
	}
}


export default CardIcon