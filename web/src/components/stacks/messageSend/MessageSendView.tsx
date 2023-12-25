import imgMsg from "@/assets/mg-hdr.svg"
import Header from "@/components/Header"
import ActionGroup from "@/components/buttons/ActionGroup"
import Button from "@/components/buttons/Button"
import TextArea from "@/components/input/TextArea"
import cnnSo from "@/stores/connections"
import { COLOR_VAR } from "@/stores/layout"
import { MessageSendState, MessageSendStore } from "@/stores/stacks/send"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent } from "react"
import SubjectsDialog from "./SubjectsDialog"



interface Props {
	store?: MessageSendStore
	style?: React.CSSProperties,
}

const MessageSendView: FunctionComponent<Props> = ({
	store: sendSo,
	style,
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
	const cnn = cnnSo.getById(sendSa.connectionId)
	const subs = cnn?.subscriptions ?? []
	return (
		<div style={{ ...cssContainer }}>

			<Header view={sendSo} />

			<ActionGroup>
				<Button
					select={sendSa.subsOpen}
					label="SUBJECT"
					onClick={handleSubsClick}
					colorVar={COLOR_VAR.YELLOW}
				/>
				<Button
					label="SEND"
					onClick={handleSend}
					colorVar={COLOR_VAR.YELLOW}
				/>
			</ActionGroup>

			<div style={{ ...cssForm, ...style }}>
				<TextArea style={{ flex: 1 }}
					value={sendSa.text}
					onChange={handleTextChange}
				/>
			</div>

			<SubjectsDialog store={sendSo} />
		</div>
	)
}

export default MessageSendView

const cssContainer: React.CSSProperties = {
	position: "relative",
	flex: 1,
	display: "flex",
	flexDirection: "column",
	height: "100%",
	width: "300px",
}

const cssForm: React.CSSProperties = {
	display: "flex",
	flexDirection: "column",
	flex: 1,
	marginLeft: 8,
}