import Button from "@/components/buttons/Button"
import FrameworkCard from "@/components/cards/FrameworkCard"
import FindInput from "@/components/input/FindInput"
import { MessagesState, MessagesStore } from "@/stores/stacks/connection/messages"
import { Message } from "@/types/Message"
import { debounce } from "@/utils/time"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent, useEffect, useMemo, useState } from "react"
import FormatDialog from "../../editor/FormatDialog"
import MessagesList from "./MessagesList"
import SubjectsDialog from "./SubjectsDialog"



interface Props {
	store?: MessagesStore
}

const MessagesView: FunctionComponent<Props> = ({
	store: msgSo,
}) => {

	// STORE
	const msgSa = useStore(msgSo) as MessagesState
	//const cnnSa = useStore(cnnSo) as ConnectionState

	// HOOKs
	const [textFind, setTextFind] = useState(msgSa.textSearch ?? "")
	//const dropRef = useRef<HTMLDivElement>(null)
	// useEffect(() => {
	// 	if (!dropRef.current || msgSo.state.size != VIEW_SIZE.COMPACT) return
	// 	//const idInt = setInterval(() => {
	// 	const animation = dropRef.current.animate([
	// 		{ transform: 'translateY(0px)', visibility: "visible" },
	// 		{ transform: 'translateY(600px)', opacity: 0 }
	// 	], {
	// 		duration: 1000,
	// 		easing: layoutSo.state.theme.transitions[1]
	// 	});
	// 	animation.play();
	// 	//}, 2000)
	// 	//return () => clearInterval(idInt)
	// }, [msgSo.state.messages])

	useEffect(()=>{
		if ( !(msgSa.subscriptions?.length > 0) || !msgSa.subscriptions.every( s => s.disabled) ) return
		msgSo.setSubscriptionsOpen(true)
	},[])

	// HANDLER
	const handleClickSubs = (e: React.MouseEvent, select: boolean) => {
		msgSo.setSubscriptionsOpen(!select)
	}
	const handleFormatsClick = () => msgSo.setFormatsOpen(true)
	const handleSendClick = () => msgSo.openMessageSend()
	const hendleMessageClick = (message: Message) => msgSo.openMessageDetail(message)
	const handleClear = () => msgSo.setMessages([])
	const handleSearchChange = (value: string) => {
		setTextFind(value)
		debounce(`text-find-${msgSa.uuid}`, () => msgSo.setTextSearch(value), 2000)
	}

	// RENDER
	const messages = useMemo(() => msgSo.getFiltered(), [msgSa.textSearch, msgSa.messages])
	const formatSel = msgSa.format.toUpperCase()

	return <FrameworkCard
		store={msgSo}
		actionsRender={<>
			<FindInput
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
				children="SEND"
				onClick={handleSendClick}
			/>
		</>}
		// iconizedRender={
		// 	<div ref={dropRef} style={{ marginTop: 15, visibility: "hidden" }}>
		// 		<DropIcon fill={layoutSo.state.theme.palette.var[variant].bg} />
		// 	</div>
		// }
	>

		<MessagesList
			messages={messages}
			format={msgSa.format}
			onMessageClick={hendleMessageClick}
			onClear={handleClear}
			style={{ marginLeft: '-10px', marginRight: '-10px' }}
		/>

		<SubjectsDialog store={msgSo} />

		<FormatDialog store={msgSo as any} />

	</FrameworkCard>
}

export default MessagesView

