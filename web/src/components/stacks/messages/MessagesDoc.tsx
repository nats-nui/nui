import Header from "@/components/Heder"
import { MessagesState, MessagesStore, PARAMS_MESSAGES } from "@/stores/messages"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent } from "react"



interface Props {
	store?: MessagesStore
}

const MessagesDoc: FunctionComponent<Props> = ({
	store: msgSo,
}) => {

	// STORE
	const msgSa = useStore(msgSo) as MessagesState

	// HOOKs
	// useEffect(() => {
	// 	console.log("update!")
	// }, [msgSa])

	// HANDLER
	
	// RENDER
	return (
		<div style={cssContainer}>
			<Header view={msgSo} />
			i messages di {msgSa.params?.[PARAMS_MESSAGES.CONNECTION_ID]?.[0]}			
		</div>
	)
}

export default MessagesDoc

const cssContainer: React.CSSProperties = {
	flex: 1,
	display: "flex", 
	flexDirection: "column",
}
