import Button from "@/components/buttons/Button"
import FrameworkCard from "@/components/cards/FrameworkCard"
import MyEditor from "@/components/editor"
import BoxV from "@/components/format/BoxV"
import Label from "@/components/format/Label"
import TextInput from "@/components/input/TextInput"
import { MessageSendState, MessageSendStore } from "@/stores/stacks/messageSend"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent, useRef } from "react"
import FormatDialog from "../messages/FormatDialog"
import SubjectsDialog from "./SubjectsDialog"



interface Props {
	store?: MessageSendStore
}

const MessageSendView: FunctionComponent<Props> = ({
	store: sendSo,
}) => {

	// STORE
	const sendSa = useStore(sendSo) as MessageSendState

	// HOOKs

	// HANDLER
	const handleSend = () => sendSo.publish()
	const handleValueChange = (value: string) => sendSo.setText(value)
	const handleSubsClick = (e: React.MouseEvent, select: boolean) => {
		if (select) return
		sendSo.setSubsOpen(!select)
	}
	const handleSubjectChange = (value: string) => sendSo.setSubject(value)

	const handleFormat = () => sendSa.editorRef.format()
	const handleDialogFormatOpen = () => sendSo.setFormatsOpen(true)

	// RENDER
	const formatSel = sendSa.format?.toUpperCase() ?? ""
	const variant = sendSa.colorVar

	return <FrameworkCard
		store={sendSo}
		actionsRender={<>
			<Button
				select={sendSa.formatsOpen}
				children={formatSel}
				variant={variant}
				onClick={handleDialogFormatOpen}
			/>
			<Button
				children="FORMAT"
				onClick={handleFormat}
				variant={variant}
			/>
			<Button
				select={sendSa.subsOpen}
				children="SUBJECT"
				onClick={handleSubsClick}
				variant={variant}
			/>
			<Button
				children="SEND"
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

		<MyEditor
			ref={ref => sendSa.editorRef = ref}
			format={sendSa.format}
			value={sendSa.text}
			onChange={handleValueChange}
		/>

		<SubjectsDialog store={sendSo} />

		<FormatDialog store={sendSo} />

	</FrameworkCard>

}

export default MessageSendView
