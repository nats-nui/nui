import Button from "@/components/buttons/Button"
import FrameworkCard from "@/components/cards/FrameworkCard"
import MyEditor from "@/components/editor"
import BoxV from "@/components/format/BoxV"
import Label from "@/components/format/Label"
import TextInput from "@/components/input/TextInput"
import { MessageSendState, MessageSendStore } from "@/stores/stacks/connection/messageSend"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent, useRef } from "react"
import FormatDialog from "../../editor/FormatDialog"
import SubjectsDialog from "./SubjectsDialog"
import TooltipWrapCmp from "@/components/TooltipWrapCmp"
import IconButton from "@/components/buttons/IconButton"
import CopyIcon from "@/icons/CopyIcon"
import FormatIcon from "@/icons/FormatIcon"
import FormatAction from "@/components/editor/FormatAction"
import Form from "@/components/format/Form"



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

	// RENDER
	return <FrameworkCard
		store={sendSo}
		actionsRender={<>

			<FormatAction store={sendSo} />
			<div style={{ height: "20px", width: "2px", backgroundColor: "rgba(255,255,255,.3)" }} />

			<Button
				select={sendSa.subsOpen}
				children="SUBJECT"
				onClick={handleSubsClick}
			/>
			<Button
				children="SEND"
				onClick={handleSend}
			/>
		</>}
	>
		<Form style={{ height: "100%" }}>
			<BoxV>
				<div className="lbl-prop">SUBJECT</div>
				<TextInput
					value={sendSa.subject}
					onChange={handleSubjectChange}
				/>
			</BoxV>
			<MyEditor
				ref={ref => sendSa.editorRef = ref}
				format={sendSa.format}
				value={sendSo.getEditorText()}
				onChange={handleValueChange}
			/>
		</Form>

		<SubjectsDialog store={sendSo} />
		<FormatDialog store={sendSo} />

	</FrameworkCard>

}

export default MessageSendView
