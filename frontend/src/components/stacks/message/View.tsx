import Button from "@/components/buttons/Button"
import FrameworkCard from "@/components/cards/FrameworkCard"
import MyEditor from "@/components/editor"
import BoxV from "@/components/format/BoxV"
import Label from "@/components/format/Label"
import { MessageState, MessageStore } from "@/stores/stacks/message"
import { useStore } from "@priolo/jon"
import { editor } from "monaco-editor"
import { FunctionComponent, useRef } from "react"
import FormatDialog from "../messages/FormatDialog"



interface Props {
	store?: MessageStore
}

/** dettaglio di un messaggio */
const MessageView: FunctionComponent<Props> = ({
	store: msgSo,
}) => {

	// STORE
	const msgSa = useStore(msgSo) as MessageState

	// HOOKs

	// HANDLER
	const handleOpenDialogFormats = () => msgSo.setFormatsOpen(true)
	const handleCopy = () => navigator.clipboard.writeText(text)
	const handleFormat = () => msgSa.editorRef.format()

	// RENDER
	const text = msgSa.message.payload
	const formatLabel = msgSa.format.toUpperCase()
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

		<MyEditor 
			ref={ref => msgSa.editorRef = ref}
			format={msgSa.format}
			value={text}
		/>

		<FormatDialog store={msgSo} />

	</FrameworkCard>
}

export default MessageView
