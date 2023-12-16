import imgMsg from "@/assets/mg-hdr.svg"
import Header from "@/components/Header"
import ActionGroup from "@/components/buttons/ActionGroup"
import Button from "@/components/buttons/Button"
import Dialog from "@/components/dialogs/Dialog"
import TextArea from "@/components/input/TextArea"
import List from "@/components/lists/List"
import SubscriptionRow from "@/components/lists/rows/SubscriptionRow"
import cnnSo from "@/stores/connections"
import layoutSo, { COLOR_VAR } from "@/stores/layout"
import { MessageSendState, MessageSendStore } from "@/stores/stacks/send"
import { Subscription } from "@/types"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent } from "react"



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
	const handleSubChange = (index: number) => {
		sendSo.setSubject(subs[index].subject)
		sendSo.setSubsOpen(false)
	}
	const handleSubsClose = () => {
		sendSo.setSubsOpen(false)
	}
// {"pippo":34}
	// RENDER
	const cnn = cnnSo.getById(sendSa.connectionId)
	const subs = cnn?.subscriptions ?? []
	return (
		<div style={{ ...cssContainer, ...style }}>

			<Header view={sendSo} icon={<img src={imgMsg} />} />

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

			<TextArea
				value={sendSa.text}
				onChange={handleTextChange}
			/>

			<Dialog
				open={sendSa.subsOpen}
				store={sendSo}
				onClose={handleSubsClose}
			>
				<List<Subscription>
					style={cssDialogSubs}
					items={subs}
					RenderRow={SubscriptionRow}
					onChangeSelect={handleSubChange}
				/>
			</Dialog>
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

const cssDialogSubs: React.CSSProperties = {
	width: 70,
	flex: 1,
	padding: '10px 15px',
	backgroundColor: layoutSo.state.theme.palette.var[COLOR_VAR.YELLOW].bg,
	color: layoutSo.state.theme.palette.var[COLOR_VAR.YELLOW].fg,
}