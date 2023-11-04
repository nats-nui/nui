import imgMsg from "@/assets/msg-hdr.svg"
import Header from "@/components/Heder"
import cnnSo, { ConnectionState } from "@/stores/connections"
import { MessagesState, MessagesStore, PARAMS_MESSAGES } from "@/stores/stacks/messages"
import { Subscription } from "@/types"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent, useEffect, useRef } from "react"
import Dialog from "../dialogs/Dialog"
import ListEditDlg from "../dialogs/ListEditDlg"
import MessageRow from "./MessageRow"



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
		//console.log("start connection " + msgSa.params[PARAMS_MESSAGES.CONNECTION_ID])
		msgSo.connect()
	}, [cnnSa.all])
	const scrollRef = useRef(null)
	const noScroll = useRef(false)
	useEffect(() => {
		if ( noScroll.current ) return
		const node = scrollRef.current
		if (!node) return
		node.scrollTop = node.scrollHeight - node.clientHeight
		console.log(node.scrollTop, node.scrollHeight, node.clientHeight)
	}, [msgSa.history])

	// HANDLER
	const handleClickDetail = () => {
		msgSo.setDialogOpen(true)
	}
	const handleCloseDetail = () => {
		msgSo.setDialogOpen(false)
	}
	const handleChangeSubs = (newSubs: Subscription[]) => {
		msgSo.setSubscriptions(newSubs)
	}
	const handleDown = ( e:React.MouseEvent) => {
		noScroll.current = true
	}
	const handleUp = ( e:React.MouseEvent) => {
		const node = scrollRef.current
		if ( node.scrollTop >= node.scrollHeight - node.clientHeight-200) {
			noScroll.current = false
		}
	}

	// RENDER
	const [id] = msgSa.params?.[PARAMS_MESSAGES.CONNECTION_ID]
	const cnn = cnnSo.getById(id)

	return (
		<div style={{ ...cssContainer, ...style }}>
			<Header view={msgSo} title={cnn?.name} icon={<img src={imgMsg} />} />
			<button onClick={handleClickDetail}>detail</button>
			<button onClick={handleCloseDetail}>close</button>
			<div>i messages di {id}</div>

			<div ref={scrollRef}
				onMouseDown={handleDown}
				onMouseUp={handleUp}
				
				style={{ flex: 1, width: "250px", height: "100%", overflowY: "auto" }}
			>
				{msgSa.history.map((message, index )=> <MessageRow key={index}
					message={message}
				/>)}
			</div>

			<Dialog store={msgSo}>
				<ListEditDlg<Subscription>
					items={msgSa.subscriptions}
					fnLabel={(sub) => sub.subject}
					fnNewItem={() => ({ subject: "<new>" })}
					onChange={handleChangeSubs}
					onClose={handleCloseDetail}
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
