import imgMsg from "@/assets/msg-hdr.svg"
import Header from "@/components/Heder"
import cnnSo, { ConnectionState } from "@/stores/connections"
import { MessagesState, MessagesStore } from "@/stores/stacks/messages"
import { Subscription } from "@/types"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent, useEffect } from "react"
import Dialog from "../dialogs/Dialog"
import ListEditDlg from "../dialogs/ListEditDlg"
import MessagesList2 from "./MessagesList2"
import SubRow from "@/components/subscription/Row"
import SubDetail from "@/components/subscription/Detail"
import { PARAMS_MESSAGES } from "@/stores/stacks/messages/utils"
import ActionGroup from "@/components/buttons/ActionGroup"
import Button from "@/components/buttons/Button"
import layoutSo from "@/stores/layout"
import SubscriptionsList from "../connections/sunscriptions/SubscriptionsList"
import Label from "@/components/input/Label"



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
	}, [cnnSa.all])

	// HANDLER
	const handleClickSubs = (e:React.MouseEvent, select:boolean) => {
		if ( select) return
		msgSo.setSubscriptionsOpen(!select)
	}
	const handleChangeSubs = (newSubs: Subscription[]) => {
		msgSo.setSubscriptions(newSubs)
	}
	const handleCloseSubsDialog = () => {
		msgSo.setSubscriptionsOpen(false)
		msgSo.sendSubscriptions()
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
	const [id] = msgSa.params?.[PARAMS_MESSAGES.CONNECTION_ID]
	const cnn = cnnSo.getById(id)
	const labelSubscription = msgSa.subject ?? "subj"


	return (
		<div style={{ ...cssContainer, ...style }}>

			<Header view={msgSo} title={cnn?.name} icon={<img src={imgMsg} />} />

			<ActionGroup>
				<Button
					select={msgSa.subscriptionsOpen}
					label="SUBJECTS"
					onClick={handleClickSubs}
					colorVar={1}
				/>
			</ActionGroup>

			<MessagesList2 messages={msgSa.history} />

			<Dialog
				open={msgSa.subscriptionsOpen}
				store={msgSo}
				onClose={handleCloseSubsDialog}
			>
				
				<SubscriptionsList noDisable
					style={cssDialogSubs}
					subscriptions={msgSa.subscriptions}
					onChange={handleChangeSubs}
				/>
				{/* <ListEditDlg<Subscription> style={cssDialogSubs}
					items={msgSa.subscriptions}
					RenderRow={SubRow}
					RenderDetail={SubDetail}
					fnNewItem={() => ({ subject: "<new>" })}
					onChange={handleChangeSubs}
				/> */}
			</Dialog>

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
			</Dialog>

		</div>
	)
}

export default MessagesView

const cssContainer: React.CSSProperties = {
	flex: 1,
	display: "flex",
	flexDirection: "column",
	height: "100%",
	width: "300px",
}

const cssDialogSubs: React.CSSProperties = {
	width: 200,
	flex: 1,
	paddingLeft: 15,
	backgroundColor: layoutSo.state.theme.palette.bg.acid[1],
	color: layoutSo.state.theme.palette.fg.acid[1],
}