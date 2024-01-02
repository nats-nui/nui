import FrameworkCard from "@/components/FrameworkCard"
import Button from "@/components/buttons/Button"
import TextArea from "@/components/input/TextArea"
import { MessageSendState, MessageSendStore } from "@/stores/stacks/send"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent } from "react"
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
	const handleSend = () => {
		sendSo.publish()
	}
	const handleTextChange = (text: string) => {
		sendSo.setText(text)
	}
	const handleSubsClick = (e: React.MouseEvent, select: boolean) => {
		if (select) return
		sendSo.setSubsOpen(!select)
	}

	// RENDER
	const variant = sendSo.getColorVar()

	return <FrameworkCard
		store={sendSo}
		actionsRender={<>
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
		<div style={cssForm}>
			<TextArea style={{ flex: 1 }}
				variant={variant}
				value={sendSa.text}
				onChange={handleTextChange}
			/>
		</div>

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