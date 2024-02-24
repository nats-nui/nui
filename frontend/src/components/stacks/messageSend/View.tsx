import FrameworkCard from "@/components/cards/FrameworkCard"
import Button from "@/components/buttons/Button"
import { MessageSendState, MessageSendStore } from "@/stores/stacks/messageSend"
import { Editor, Monaco } from "@monaco-editor/react"
import { useStore } from "@priolo/jon"
import { editor } from "monaco-editor"
import React, { FunctionComponent, useRef } from "react"
import SubjectsDialog from "./SubjectsDialog"
import TextInput from "@/components/input/TextInput"
import BoxV from "@/components/format/BoxV"
import Label from "@/components/format/Label"
import FormatDialog from "../messages/FormatDialog"
import { getEditorLanguage } from "@/stores/stacks/message/utils"



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
	const handleSubjectChange = (value: string) => sendSo.setSubject(value)
	const handleFormatsClick = () => sendSo.setFormatsOpen(true)

	// RENDER
	const formatSel = sendSa.format?.toUpperCase() ?? ""
	const variant = sendSa.colorVar

	return <FrameworkCard
		store={sendSo}
		actionsRender={<>
			<Button
				select={sendSa.formatsOpen}
				label={formatSel}
				variant={variant}
				onClick={handleFormatsClick}
			/>
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
		<BoxV style={{marginBottom: 10}}>
			<Label>Subject</Label>
			<TextInput
				value={sendSa.subject}
				onChange={handleSubjectChange}
			/>
		</BoxV>

		<Editor
			//defaultLanguage="json"
			language={getEditorLanguage(sendSa.format)}
			value={sendSa.text}
			onChange={handleValueChange}
			options={sendSa.editor}
			theme="vs-dark"
			onMount={handleEditorDidMount}
		/>

		<SubjectsDialog store={sendSo} />

		<FormatDialog store={sendSo} />

	</FrameworkCard>

}

export default MessageSendView
