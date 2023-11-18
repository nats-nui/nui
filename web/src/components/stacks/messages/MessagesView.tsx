import imgMsg from "@/assets/msg-hdr.svg"
import Header from "@/components/Heder"
import cnnSo, { ConnectionState } from "@/stores/connections"
import { MessagesState, MessagesStore, PARAMS_MESSAGES } from "@/stores/stacks/messages"
import { Subscription } from "@/types"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent, useEffect } from "react"
import Dialog from "../dialogs/Dialog"
import ListEditDlg from "../dialogs/ListEditDlg"
import MessagesList2 from "./MessagesList2"
import SubRow from "@/components/subscription/Row"
import SubDetail from "@/components/subscription/Detail"



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
	const handleSubscriptions = () => {
		msgSo.setSubscriptionsOpen(true)
	}
	const handleChangeSubs = (newSubs: Subscription[]) => {
		msgSo.setSubscriptions(newSubs)
	}
	const handleCloseSubscriptionsDialog = () => {
		msgSo.setSubscriptionsOpen(false)
		msgSo.sendSubscriptions()
	}


	const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		msgSo.setMessage(e.target.value)
	}
	const handleMessagePublish = (_: React.MouseEvent) => {
		msgSo.publishMessage()
	}
	const handleMessageSub = (_: React.MouseEvent) => {
		msgSo.setSubjectOpen(true)
	}
	const handleCloseSubjectDialog = () => {
		msgSo.setSubjectOpen(false)
	}

	// RENDER
	const [id] = msgSa.params?.[PARAMS_MESSAGES.CONNECTION_ID]
	const cnn = cnnSo.getById(id)

	return (
		<div style={{ ...cssContainer, ...style }}>
			<Header view={msgSo} title={cnn?.name} icon={<img src={imgMsg} />} />
			<button onClick={handleSubscriptions}>subscriptions</button>
			<div>i messages di {id}</div>

			<MessagesList2 messages={msgSa.history} />
			{/* <MessagesList messages={msgSa.history} /> */}

			<div style={{ display: "flex" }}>
				<button
					onClick={handleMessagePublish}
				>SEND</button>
				<input
					value={msgSa.message}
					onChange={handleMessageChange}
				/>
				<button
					onClick={handleMessageSub}
				>sub</button>
			</div>

			<Dialog
				open={msgSa.subscriptionsOpen}
				store={msgSo}
				onClose={handleCloseSubscriptionsDialog}
			>
				<ListEditDlg<Subscription>
					items={msgSa.subscriptions}
					RenderRow={SubRow}
					RenderDetail={SubDetail}
					fnNewItem={() => ({ subject: "<new>" })}
					onChange={handleChangeSubs}
				/>
			</Dialog>

			<Dialog
				open={msgSa.subjectOpen}
				store={msgSo}
				onClose={handleCloseSubjectDialog}
			>
				<div style={{ flex: 1, display: "flex", flexDirection: "column", backgroundColor: "red" }}>
					<div style={{ flex: 1 }} />
					<ListEditDlg<Subscription>
						items={msgSa.subscriptions}
						RenderRow={SubRow}
						onChangeSelect={index => {
							msgSo.setSubject(msgSa.subscriptions[index].subject)
							msgSo.setSubjectOpen(false)
						}}
					//RenderDetail={SubDetail}
					//fnNewItem={() => ({ subject: "<new>" })}
					//onChange={handleChangeSubs}
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
}
