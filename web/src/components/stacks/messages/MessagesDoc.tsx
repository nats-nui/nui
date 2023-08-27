import Header from "@/components/Heder"
import { MessagesState, MessagesStore, PARAMS_MESSAGES } from "@/stores/stacks/messages"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent } from "react"
import imgMsg from "@/assets/msg-hdr.svg"
import cnnSo from "@/stores/connections"



interface Props {
	store?: MessagesStore
	style?: React.CSSProperties,
}

const MessagesDoc: FunctionComponent<Props> = ({
	store: msgSo,
	style,
}) => {

	// STORE
	const msgSa = useStore(msgSo) as MessagesState

	// HOOKs

	// HANDLER

	// RENDER
	const [id] = msgSa.params?.[PARAMS_MESSAGES.CONNECTION_ID]
	const cnn = cnnSo.getById(id)

	return (
		<div style={{...cssContainer, ...style}}>
			<Header view={msgSo} title={cnn?.name} icon={<img src={imgMsg} />} />
			i messages di {id}
		</div>
	)
}

export default MessagesDoc

const cssContainer: React.CSSProperties = {
	flex: 1,
	display: "flex",
	flexDirection: "column",
}
