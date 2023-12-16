import imgMsg from "@/assets/mg-hdr.svg"
import Header from "@/components/Header"
import { MessageState, MessageStore } from "@/stores/stacks/message"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent } from "react"
import JsonCmp from "../../json/JsonCmp"



interface Props {
	store?: MessageStore
	style?: React.CSSProperties,
}

const MessageView: FunctionComponent<Props> = ({
	store: msgSo,
	style,
}) => {

	// STORE
	const msgSa = useStore(msgSo) as MessageState

	// HOOKs

	// HANDLER

	// RENDER
	const text = msgSa.message?.json ?? ""
	return (
		<div style={{ ...cssContainer, ...style }}>
			<Header view={msgSo} icon={<img src={imgMsg} />} />

			<div style={{  overflowY: "auto" }}>
				<JsonCmp json={text} style={{ margin: "15px 0px 15px 15px"}}/>
			</div>
		</div>
	)
}

export default MessageView

const cssContainer: React.CSSProperties = {
	position: "relative",
	flex: 1,
	display: "flex",
	flexDirection: "column",
	height: "100%",
	width: "300px",
}
