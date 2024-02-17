import FrameworkCard from "@/components/FrameworkCard"
import Button from "@/components/buttons/Button"
import TextArea from "@/components/input/TextArea"
import { MessageSendState, MessageSendStore } from "@/stores/stacks/messageSend"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent, useRef } from "react"
import SubjectsDialog from "./SubjectsDialog"
import { Editor, Monaco } from "@monaco-editor/react"
import { editor } from "monaco-editor"



interface Props {
	store?: MessageSendStore
}

const MessageSendView: FunctionComponent<Props> = ({
	store: sendSo,
}) => {

	// STORE
	const sendSa = useStore(sendSo) as MessageSendState

	// HOOKs
	const editorRef = useRef<editor.IStandaloneCodeEditor>(null)

	// HANDLER
	const handleSend = () => {
		sendSo.publish()
	}
	const handleValueChange = (value: string | undefined, ev: editor.IModelContentChangedEvent) => {
		sendSo.setText(value)
	}
	const handleSubsClick = (e: React.MouseEvent, select: boolean) => {
		if (select) return
		sendSo.setSubsOpen(!select)
	}
	const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
		editorRef.current = editor
	}
	const handleFormat = () => editorRef.current.getAction('editor.action.formatDocument').run()

	// RENDER
	const variant = sendSa.colorVar

	return <FrameworkCard
		store={sendSo}
		actionsRender={<>
			<Button
				label="FORMAT"
				onClick={handleFormat}
				variant={variant}
			/>
			<Button
				select={sendSa.subsOpen}
				label="SUBJECT"
				onClick={handleSubsClick}
				variant={variant}
			/>
			<Button
				label="SEND"
				onClick={handleSend}
				variant={variant}
			/>
		</>}
	>

		<Editor
			defaultLanguage="json"
			value={sendSa.text}
			onChange={handleValueChange}
			options={sendSa.editor}
			theme="vs-dark"
			onMount={handleEditorDidMount}
		/>

		<SubjectsDialog store={sendSo} />

	</FrameworkCard>

}

export default MessageSendView

const cssForm: React.CSSProperties = {
	display: "flex",
	flexDirection: "column",
	flex: 1,
	marginLeft: 8,
}