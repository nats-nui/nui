import FrameworkCard from "@/components/FrameworkCard"
import Button from "@/components/buttons/Button"
import FindInput from "@/components/input/FindInput"
import cnnSo, { ConnectionState } from "@/stores/connections"
import { MessagesState, MessagesStore } from "@/stores/stacks/messages"
import { HistoryMessage } from "@/stores/stacks/messages/utils"
import { Subscription } from "@/types"
import { debounce } from "@/utils/time"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent } from "react"
import Dialog from "../../dialogs/Dialog"
import SubscriptionsList from "../../lists/sunscriptions/SubscriptionsList"
import FormatDialog from "./FormatDialog"
import ItemsList from "./ItemsList"



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
	const hendleMessageClick = (message: HistoryMessage) => msgSo.openMessageDetail(message)
	const handleSearchChange = (value: string) => msgSo.setTextSearch(value)

	// RENDER
	const formatSel = msgSa.format.toUpperCase()
	const variant = msgSo.getColorVar()

	return <FrameworkCard
		store={msgSo}
		actionsRender={<>
			<FindInput
				value={msgSa.textSearch ?? ""}
				onChange={handleSearchChange}
			/>
			<Button
				select={msgSa.formatsOpen}
				label={formatSel}
				variant={variant}
				onClick={handleFormatsClick}
			/>
			<Button
				select={msgSa.subscriptionsOpen}
				label="SUBJECTS"
				onClick={handleClickSubs}
				variant={variant}
			/>
			<Button
				label="SEND"
				onClick={handleSendClick}
				variant={variant}
			/>
		</>}
	>

		<ItemsList
			messages={msgSa.history}
			format={msgSa.format}
			onMessageClick={hendleMessageClick}
		/>

		<Dialog
			title="SUBJECTS"
			width={200}
			open={msgSa.subscriptionsOpen}
			store={msgSo}
			onClose={handleCloseSubsDialog}
		>
			<SubscriptionsList
				subscriptions={msgSa.subscriptions}
				onChange={handleChangeSubs}
			/>
		</Dialog>

		<FormatDialog store={msgSo} />

	</FrameworkCard>
}

export default MessagesView
