import FrameworkCard from "@/components/cards/FrameworkCard"
import Button from "@/components/buttons/Button"
import Base64Cmp from "@/components/formatters/base64/Base64Cmp"
import HexTable from "@/components/formatters/hex/HexTable"
import { MessageState, MessageStore } from "@/stores/stacks/message"
import { MSG_FORMAT } from "@/stores/stacks/messages/utils"
import { Editor, Monaco } from "@monaco-editor/react"
import { useStore } from "@priolo/jon"
import { editor } from "monaco-editor"
import { FunctionComponent, useRef } from "react"
import FormatDialog from "../messages/FormatDialog"
import { getEditorLanguage } from "@/stores/stacks/message/utils"
import BoxV from "@/components/format/BoxV"
import Label from "@/components/format/Label"



interface Props {
	store?: MessageStore
}

const MessageView: FunctionComponent<Props> = ({
	store: msgSo,
}) => {

	// STORE
	const msgSa = useStore(msgSo) as MessageState

	// HOOKs
	const editorRef = useRef<editor.IStandaloneCodeEditor>(null)

	// HANDLER
	const handleOpenDialogFormats = () => msgSo.setFormatsOpen(true)
	const handleCopy = () => navigator.clipboard.writeText(text)
	const handleFormat = () => editorRef.current.getAction('editor.action.formatDocument').run()
	const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
		editorRef.current = editor
		// // Formatta automaticamente il JSON all'avvio
		// setTimeout(() => {
		// 	editor.getAction('editor.action.formatDocument').run();
		// }, 300)
	}

	// RENDER
	const text = msgSa.message.payload
	const format = msgSa.format
	const formatLabel = format.toUpperCase()
	const variant = msgSa.colorVar

	return <FrameworkCard
		store={msgSo}
		actionsRender={<>
			<Button
				children="COPY"
				onClick={handleCopy}
				variant={variant}
			/>
			<Button
				children="FORMAT"
				onClick={handleFormat}
				variant={variant}
			/>
			<Button
				select={msgSa.formatsOpen}
				children={formatLabel}
				onClick={handleOpenDialogFormats}
				variant={variant}
			/>
		</>}
	>
		<BoxV style={{ marginBottom: 10 }}>
			<Label>Subject</Label>
			<div className="label-form-2">
				{msgSa.message.subject}
			</div>
		</BoxV>
		{format == MSG_FORMAT.BASE64 ? (
			<Base64Cmp text={text} />
		) : format == MSG_FORMAT.HEX ? (
			<HexTable text={text} />
		) : (
			<Editor
				//defaultLanguage="json"
				language={getEditorLanguage(msgSa.format)}
				value={text}
				options={msgSa.editor}
				theme="vs-dark"
				onMount={handleEditorDidMount}
			/>
		)}

		<FormatDialog store={msgSo} />

	</FrameworkCard>
}

export default MessageView
