import imgMsg from "@/assets/msg-hdr.svg"
import Header from "@/components/Header"
import ActionGroup from "@/components/buttons/ActionGroup"
import Button from "@/components/buttons/Button"
import FindInput from "@/components/input/FindInput"
import StringRow from "@/components/lists/StringRow"
import cnnSo, { ConnectionState } from "@/stores/connections"
import { VIEW_SIZE } from "@/stores/docs/viewBase"
import layoutSo from "@/stores/layout"
import { MessagesState, MessagesStore } from "@/stores/stacks/messages"
import { HistoryMessage, MSS_TYPES } from "@/stores/stacks/messages/utils"
import { Subscription } from "@/types"
import { debounce } from "@/utils/time"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent, useEffect } from "react"
import Dialog from "../../dialogs/Dialog"
import List from "../../lists/List"
import SubscriptionsList from "../../lists/sunscriptions/SubscriptionsList"
import MessagesList2 from "./MessagesList2"



interface Props {
	store?: MessagesStore
	style?: React.CSSProperties,
}

const MessagesView: FunctionComponent<Props> = ({
	store: msgSo,
	style,
}) => {

	// STORE
	const msgSa = useStore(msgSo) as MessagesState
	const cnnSa = useStore(cnnSo) as ConnectionState

	// HOOKs
	useEffect(() => {
		if (!cnnSa.all || cnnSa.all.length == 0) return
		msgSo.connect()
		return () => msgSo.disconnect()
	}, [cnnSa.all])

	// HANDLER
	const handleClickSubs = (e: React.MouseEvent, select: boolean) => {
		if (select) return
		msgSo.setSubscriptionsOpen(!select)
	}
	const handleCloseSubsDialog = () => {
		msgSo.setSubscriptionsOpen(false)
	}
	const handleChangeSubs = (newSubs: Subscription[]) => {
		msgSo.setSubscriptions(newSubs)
		debounce("MessagesView:handleChangeSubs", () => {
			msgSo.sendSubscriptions()
		}, 2000)
	}


	const handleTypesClick = () => {
		msgSo.setTypesOpen(true)
	}
	const handleTypesClose = () => {
		msgSo.setTypesOpen(false)
	}
	const handleTypesSelect = (index: number) => {
		console.log(index)
		msgSo.setTypesOpen(false)
	}

	const hendleMessageClick = (message: HistoryMessage) => {
		msgSo.openMessageDetail(message)
	}



	const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		msgSo.setMessage(e.target.value)
	}
	const handleMessagePublish = (_: React.MouseEvent) => {

		msgSo.publishMessage()
	}
	const handleMessageSubOpen = (_: React.MouseEvent) => {
		msgSo.setSubjectOpen(true)
	}
	const handleMessageSubSelect = (index: number) => {
		msgSo.setSubject(msgSa.subscriptions[index].subject)
		msgSo.setSubjectOpen(false)
	}
	const handleMessageSubClose = () => {
		msgSo.setSubjectOpen(false)
	}



	// RENDER
	return (
		<div style={{ ...cssContainer, ...style }}>

			<Header view={msgSo} icon={<img src={imgMsg} />} />

			{msgSa.size != VIEW_SIZE.ICONIZED && (<>
				<ActionGroup>
					<FindInput 
						style={{ marginLeft: 7 }} 
					/>
					<Button
						select={msgSa.typesOpen}
						label="TYPE"
						onClick={handleTypesClick}
						colorVar={1}
					/>
					<Button
						select={msgSa.subscriptionsOpen}
						label="SUBJECTS"
						onClick={handleClickSubs}
						colorVar={1}
					/>
				</ActionGroup>
				<MessagesList2
					messages={msgSa.history}
					onMessageClick={hendleMessageClick}
				/>
			</>)}

			<Dialog
				open={msgSa.subscriptionsOpen}
				store={msgSo}
				onClose={handleCloseSubsDialog}
			>
				<SubscriptionsList
					style={cssDialogSubs}
					subscriptions={msgSa.subscriptions}
					onChange={handleChangeSubs}
				/>
			</Dialog>

			<Dialog
				open={msgSa.typesOpen}
				store={msgSo}
				onClose={handleTypesClose}
			>
				<List<string>
					style={cssDialogTypes}
					items={Object.values(MSS_TYPES)}
					RenderRow={StringRow}
					onChangeSelect={handleTypesSelect}
				/>
			</Dialog>

			{/* 
			<Dialog
				open={msgSa.subjectOpen}
				store={msgSo}
				onClose={handleMessageSubClose}
			>
				<div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: 'flex-end', backgroundColor: "#a0e312" }}>
					<ListEditDlg<Subscription>
						items={msgSa.subscriptions}
						RenderRow={SubRow}
						onChangeSelect={handleMessageSubSelect}
					/>
				</div>
			</Dialog> */}

		</div>
	)
}

export default MessagesView

const cssContainer: React.CSSProperties = {
	position: "relative",
	flex: 1,
	display: "flex",
	flexDirection: "column",
	height: "100%",
	width: "300px",
}

const cssDialogTypes: React.CSSProperties = {
	width: 70,
	flex: 1,
	padding: '10px 15px',
	backgroundColor: layoutSo.state.theme.palette.var[1].bg,
	color: layoutSo.state.theme.palette.var[1].fg,
}
const cssDialogSubs: React.CSSProperties = {
	width: 200,
	flex: 1,
	padding: '10px 15px',
	backgroundColor: layoutSo.state.theme.palette.var[1].bg,
	color: layoutSo.state.theme.palette.var[1].fg,
}