import FrameworkCard from "@/components/cards/FrameworkCard"
import PauseIcon from "@/icons/PauseIcon"
import PlayIcon from "@/icons/PlayIcon"
import MessagesIcon from "@/icons/cards/MessagesIcon"
import { MessagesState, MessagesStore } from "@/stores/stacks/connection/messages"
import { DOC_TYPE } from "@/types"
import { Message } from "@/types/Message"
import { debounce } from "@/utils/time"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent, useEffect, useMemo, useState } from "react"
import FormatDialog from "../../../editor/FormatDialog"
import clsCardRedeye from "../../CardCyanDef.module.css"
import clsCardBoring from "../../CardBoringDef.module.css"
import layoutSo from "@/stores/layout"
import MessagesList from "../../messages/MessagesList"
import SubjectsDialog from "./SubjectsDialog"
import { Button, FindInputHeader, FloatButton } from "@priolo/jack"
import { MessageStore } from "../../../../stores/stacks/message"



interface Props {
	store?: MessagesStore
}

const MessagesView: FunctionComponent<Props> = ({
	store: msgSo,
}) => {

	// STORE
	useStore(msgSo.state.group)
	const msgSa = useStore(msgSo) as MessagesState
	useStore(layoutSo)

	// HOOKs
	const [textFind, setTextFind] = useState(msgSa.textSearch ?? "")
	useEffect(() => {
		msgSo.fetchIfVoid()
	}, [])
	useEffect(() => {
		if (msgSa.linked == null && msgSa.subscriptions?.length > 0 && msgSa.subscriptions.every(s => s.disabled)) {
			msgSo.setSubscriptionsOpen(true)
		}
	}, [msgSa.subscriptions])

	// HANDLER
	const handleClickSubs = (e: React.MouseEvent, select: boolean) => msgSo.setSubscriptionsOpen(!select)
	const handleFormatsClick = () => msgSo.setFormatsOpen(true)
	const handleSendClick = () => {
		if (isSendSelect) {
			msgSo.state.group.addLink({ view: null, parent: msgSo, anim: true })
		} else {
			msgSo.setSubscriptionsOpen(false)
			msgSo.openMessageSend()
		}
	}
	const hendleMessageClick = (message: Message) => msgSo.openMessageDetail(message)
	const handleClear = () => msgSo.setMessages([])
	const handleSearchChange = (value: string) => {
		setTextFind(value)
		debounce(`text-find-${msgSa.uuid}`, () => msgSo.setTextSearch(value), 2000)
	}
	const handlePause = () => {
		msgSo.setPause(!msgSa.pause)
		msgSo.sendSubscriptions()
	}

	// RENDER
	const messages = useMemo(() => msgSo.getFiltered(), [msgSa.textSearch, msgSa.messages])
	const formatSel = msgSa.format.toUpperCase()
	const isSendSelect = msgSa.linked?.state.type == DOC_TYPE.MESSAGE_SEND
	const storeMsg = (msgSo.state.linked as MessageStore)
		const selectedIndex = useMemo(() => {
			if (!!messages && storeMsg?.state.type == DOC_TYPE.MESSAGE && !!storeMsg.state.message) {
				return messages.findIndex(m => m.receivedAt == storeMsg.state.message.receivedAt)
			}
			return null
		}, [storeMsg?.state?.message?.receivedAt])
	const clsCard = layoutSo.state.theme == "redeye" ? clsCardRedeye : clsCardBoring

	return <FrameworkCard
		className={clsCard.root}
		icon={<MessagesIcon />}
		store={msgSo}
		actionsRender={<>
			<FindInputHeader
				value={textFind}
				onChange={handleSearchChange}
			/>
			<Button
				select={msgSa.formatsOpen}
				children={formatSel}
				onClick={handleFormatsClick}
			/>
			<Button
				select={msgSa.subscriptionsOpen}
				children="SUBJECTS"
				onClick={handleClickSubs}

			/>
			<Button
				select={isSendSelect}
				children="SEND"
				onClick={handleSendClick}
			/>
		</>}
	>

		<MessagesList
			messages={messages}
			selectedIndex={selectedIndex}
			format={msgSa.format}
			onMessageClick={hendleMessageClick}
			onClear={handleClear}
			style={{ marginLeft: '-10px', marginRight: '-10px' }}
			extraActions={<FloatButton onClick={handlePause}>
				{msgSa.pause ? <PlayIcon /> : <PauseIcon />}
			</FloatButton>}
		/>

		<SubjectsDialog store={msgSo} />

		<FormatDialog store={msgSo as any} />

	</FrameworkCard>
}

export default MessagesView

