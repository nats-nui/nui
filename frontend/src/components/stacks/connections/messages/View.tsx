import Button from "@/components/buttons/Button"
import FloatButton from "@/components/buttons/FloatButton"
import FrameworkCard from "@/components/cards/FrameworkCard"
import FindInputHeader from "@/components/input/FindInputHeader"
import PauseIcon from "@/icons/PauseIcon"
import PlayIcon from "@/icons/PlayIcon"
import { MessagesState, MessagesStore } from "@/stores/stacks/connection/messages"
import { DOC_TYPE } from "@/types"
import { Message } from "@/types/Message"
import { debounce } from "@/utils/time"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent, useEffect, useMemo, useState } from "react"
import FormatDialog from "../../../editor/FormatDialog"
import MessagesList from "../../messages/MessagesList"
import SubjectsDialog from "./SubjectsDialog"



interface Props {
	store?: MessagesStore
}

const MessagesView: FunctionComponent<Props> = ({
	store: msgSo,
}) => {

	// STORE
	useStore(msgSo.state.group)
	const msgSa = useStore(msgSo) as MessagesState

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

	return <FrameworkCard
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

