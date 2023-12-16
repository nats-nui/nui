import imgMsg from "@/assets/mg-hdr.svg"
import Header from "@/components/Header"
import { MessageState, MessageStore } from "@/stores/stacks/message"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent, useEffect, useRef, useState } from "react"
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

	// STORE
	const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor | null>(null);
	const msgSa = useStore(msgSo) as MessageState

	// HOOKs
	const monacoEl = useRef(null)
	useEffect(() => {
		if (monacoEl) {
			setEditor((editor) => {
				if (editor) return editor;

				return monaco.editor.create(monacoEl.current!, {
					value: ['function x() {', '\tconsole.log("Hello world!");', '}'].join('\n'),
					language: 'typescript'
				});
			});
		}

		return () => editor?.dispose();
	}, [monacoEl.current]);
	
	// HANDLER

	// RENDER
	const text = msgSa.message?.json ?? ""
	return (
		<div style={{ ...cssContainer, ...style }}>
			<Header view={msgSo} icon={<img src={imgMsg} />} />

			<div style={{width: "100vw", height: "100vh"}} ref={monacoEl}></div>;
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
