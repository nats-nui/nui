import FrameworkCard from "@/components/cards/FrameworkCard"
import Button from "@/components/buttons/Button"
import FindInput from "@/components/input/FindInput"
import EditList from "@/components/lists/EditList"
import EditSubscriptionRow from "@/components/rows/EditSubscriptionRow"
import DropIcon from "@/icons/DropIcon"
import cnnSo, { ConnectionState } from "@/stores/connections"
import layoutSo from "@/stores/layout"
import { MessagesState, MessagesStore } from "@/stores/stacks/messages"
import { Message } from "@/types/Message"
import { Subscription } from "@/types"
import { debounce } from "@/utils/time"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent, useEffect, useRef, useState } from "react"
import Dialog from "../../dialogs/Dialog"
import FormatDialog from "../../editor/FormatDialog"
import MessagesList from "./MessagesList"
import { VIEW_SIZE } from "@/stores/stacks/utils"



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
	const [textFind, setTextFind] = useState(msgSa.textSearch ?? "")
	const dropRef = useRef<HTMLDivElement>(null)
	useEffect(() => {
		if (!dropRef.current || msgSo.state.size != VIEW_SIZE.COMPACT) return
		//const idInt = setInterval(() => {
		const animation = dropRef.current.animate([
			{ transform: 'translateY(0px)', visibility: "visible" },
			{ transform: 'translateY(600px)', opacity: 0 }
		], {
			duration: 1000,
			easing: layoutSo.state.theme.transitions[1]
		});
		animation.play();
		//}, 2000)
		//return () => clearInterval(idInt)
	}, [msgSo.state.messages])

	// HANDLER
	//#region  SUBSCRIPTIONS
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
	//#endregion

	const handleFormatsClick = () => msgSo.setFormatsOpen(true)
	const handleSendClick = () => msgSo.openMessageSend()
	const hendleMessageClick = (message: Message) => msgSo.openMessageDetail(message)
	const handleClear = () => msgSo.setMessages([])
	const handleSearchChange = (value: string) => {
		setTextFind(value)
		debounce(`text-find-${msgSa.uuid}`, () => msgSo.setTextSearch(value), 2000)
	}

	// RENDER
	const formatSel = msgSa.format.toUpperCase()
	const variant = msgSa.colorVar
	const history = msgSo.getFiltered()

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
		iconizedRender={
			<div ref={dropRef} style={{ marginTop: 15, visibility: "hidden" }}>
				<DropIcon fill={layoutSo.state.theme.palette.var[variant].bg} />
			</div>
		}
	>

		<MessagesList
			messages={history}
			format={msgSa.format}
			onMessageClick={hendleMessageClick}
			onClear={handleClear}
			style={{ marginLeft: '-10px', marginRight: '-10px' }}
		/>

		<Dialog
			title="SUBJECTS"
			width={200}
			open={msgSa.subscriptionsOpen}
			store={msgSo}
			onClose={handleCloseSubsDialog}
		>
			<EditList<Subscription>
				items={msgSa.subscriptions}
				onItemsChange={handleChangeSubs}
				onNewItem={() => ({ subject: "<new>" })}
				RenderRow={EditSubscriptionRow}
			/>
		</Dialog>

		<FormatDialog store={msgSo} />

	</FrameworkCard>
}

export default MessagesView

