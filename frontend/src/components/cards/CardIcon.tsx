import ConnectionIcon from "@/icons/cards/ConnectionIcon"
import ConnectionsIcon from "@/icons/cards/ConnectionsIcon"
import MessageIcon from "@/icons/cards/MessageIcon"
import MessagesIcon from "@/icons/cards/MessagesIcon"
import { DOC_TYPE } from "@/types"
import { FunctionComponent } from "react"



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
			return <ConnectionsIcon className={className} style={style}/>
		case DOC_TYPE.CONNECTION:
			return <ConnectionIcon className={className} style={style}/>
		case DOC_TYPE.MESSAGES:
			return <MessagesIcon className={className} style={style}/>
		case DOC_TYPE.MESSAGE:
			return <MessageIcon className={className} style={style}/>
		case DOC_TYPE.MESSAGE_SEND:

		case DOC_TYPE.STREAMS:
		case DOC_TYPE.STREAM:
		case DOC_TYPE.STREAM_MESSAGES:

		case DOC_TYPE.CONSUMERS:
		case DOC_TYPE.CONSUMER:

		case DOC_TYPE.BUCKETS:
		case DOC_TYPE.BUCKET:
		case DOC_TYPE.KVENTRIES:
		case DOC_TYPE.KVENTRY:

		case DOC_TYPE.LOGS:
		default:
			return null
	}
}


export default CardIcon