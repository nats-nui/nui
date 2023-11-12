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
	const handleClickDetail = () => {
		msgSo.setDialogOpen(true)
	}
	const handleChangeSubs = (newSubs: Subscription[]) => {
		msgSo.setSubscriptions(newSubs)
	}
	const handleCloseDialog = () => {
		msgSo.sendSubscriptions()
	}
	const handleMessageChange = (e:React.ChangeEvent<HTMLInputElement>) => {
		msgSo.setMessage(e.target.value)
	}
	const handleMessageClick = (e:React.MouseEvent) => {
		
	}
	const handleMessageSubClick = (e:React.MouseEvent) => {

	}

	// RENDER
	const [id] = msgSa.params?.[PARAMS_MESSAGES.CONNECTION_ID]
	const cnn = cnnSo.getById(id)

	return (
		<div style={{ ...cssContainer, ...style }}>
			<Header view={msgSo} title={cnn?.name} icon={<img src={imgMsg} />} />
			<button onClick={handleClickDetail}>subscriptions</button>
			<div>i messages di {id}</div>

			<MessagesList2 messages={msgSa.history} />
			{/* <MessagesList messages={msgSa.history} /> */}

			<div style={{ display: "flex"}}>
				<button
					onClick={handleMessageClick}
				>SEND</button>
				<input 
					value={msgSa.message}
					onChange={handleMessageChange}
				/>
				<button
					onClick={handleMessageSubClick}
				>sub</button>
			</div>

			<Dialog 
				store={msgSo}
				onClose={handleCloseDialog}
			>
				<ListEditDlg<Subscription>
					items={msgSa.subscriptions}
					RenderRow={SubRow}
					RenderDetail={SubDetail}
					fnNewItem={() => ({ subject: "<new>" })}
					onChange={handleChangeSubs}
				/>
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
