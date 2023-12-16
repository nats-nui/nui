import imgMsg from "@/assets/mg-hdr.svg"
import Header from "@/components/Header"
import { MessageState, MessageStore } from "@/stores/stacks/message"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent, useEffect, useMemo, useRef, useState } from "react"
import JsonCmp from "../messages/JsonCmp"
import JsonCmp2 from "../messages/JsonCmp2"
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';


interface Props {
	store?: MessageStore
	style?: React.CSSProperties,
}

const MessageView: FunctionComponent<Props> = ({
	store: msgSo,
	style,
}) => {

	// STORES
	const msgSa = useStore(msgSo)

	// HOOKs
	const [html, setHtml] = useState("")

	// ricavo l'html dal testo in base al linguaggio usato
	useEffect(() => {
		monaco.editor.setTheme('vs-dark');
		async function render() {
			const res = await monaco.editor.colorize(
				JSON.stringify(msgSa.message?.json),
				"json",
				{
					
					tabSize:5
				}
			)
			setHtml(res ?? "")
		}
		render()
	}, [msgSa.message])

	// HANDLER

	// RENDER
	//const text = msgSa.message?.json ?? ""
	return (
		<div style={{ ...cssContainer, ...style }}>
			<Header view={msgSo} icon={<img src={imgMsg} />} />

			<div style={{ width: "100vw", height: "100vh" }} dangerouslySetInnerHTML={{ __html: html }} />
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
