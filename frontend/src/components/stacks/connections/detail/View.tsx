import IconButton from "@/components/buttons/IconButton"
import LinkButton from "@/components/buttons/LinkButton"
import FrameworkCard from "@/components/cards/FrameworkCard"
import RowButton from "@/components/rows/RowButton"
import TooltipWrapCmp from "@/components/tooltip/TooltipWrapCmp"
import SendIcon from "@/icons/SendIcon"
import BucketsIcon from "@/icons/cards/BucketsIcon"
import MessagesIcon from "@/icons/cards/MessagesIcon"
import StreamsIcon from "@/icons/cards/StreamsIcon"
import { CnnDetailStore } from "@/stores/stacks/connection/detail"
import { EDIT_STATE } from "@/types"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import ActionsCmp from "./Actions"
import ConnectionDetailForm from "./Form"
import SyncIcon from "@/icons/SyncIcon"



interface Props {
	store?: CnnDetailStore
}

const CnnDetailView: FunctionComponent<Props> = ({
	store: cnnDetailSo,
}) => {

	// STORE
	useStore(cnnDetailSo.state.group)
	const cnnDetailSa = useStore(cnnDetailSo)
	//const cnnSa = useStore(cnnSo)

	// HOOKs

	// HANDLER
	const handleMessagesClick = () => cnnDetailSo.openMessages()
	const handleSyncClick = () => cnnDetailSo.openSync()
	const handleStreamsClick = () => cnnDetailSo.openStreams()
	const handleBucketsClick = () => cnnDetailSo.openBuckets()
	const handleSendClick = (e: React.MouseEvent) => {
		e.stopPropagation()
		cnnDetailSo.openMessageSend()
	}

	// RENDER
	const isMessageOpen = cnnDetailSo.getMessagesOpen()
	const isSyncOpen = cnnDetailSo.getSyncOpen()
	const isStreamsOpen = cnnDetailSo.getStreamsOpen()
	const isBucketsOpen = cnnDetailSo.getBucketsOpen()
	const isNew = cnnDetailSa.editState == EDIT_STATE.NEW
	const inRead = cnnDetailSa.editState == EDIT_STATE.READ

	const ButtonSend = <TooltipWrapCmp content="SEND A MESSAGE" style={{ padding: 5}}>
		<IconButton onClick={handleSendClick}><SendIcon /></IconButton>
	</TooltipWrapCmp>

	return <FrameworkCard variantBg
		store={cnnDetailSo}
		actionsRender={<ActionsCmp store={cnnDetailSo} />}
		iconizedRender={
			<div className="lyt-v lyt-v-btts">
				<LinkButton
					icon={<MessagesIcon />}
					tooltip="MESSAGES"
					selected={isMessageOpen}
					onClick={handleMessagesClick}
					renderExtra={ButtonSend}
				/>
				<LinkButton
					icon={<SyncIcon />}
					tooltip="REQUEST / REPLY"
					selected={isSyncOpen}
					onClick={handleSyncClick}
				/>
				<LinkButton
					icon={<StreamsIcon />}
					tooltip="STREAMS"
					selected={isStreamsOpen}
					onClick={handleStreamsClick}
				/>
				<LinkButton
					icon={<BucketsIcon />}
					tooltip="BUCKETS"
					selected={isBucketsOpen}
					onClick={handleBucketsClick}
				/>
			</div>
		}
	>
		{inRead && <>
			<RowButton
				icon={<MessagesIcon />}
				label="MESSAGES"
				selected={isMessageOpen}
				onClick={handleMessagesClick}
				renderEnd={ButtonSend}
			/>
			<RowButton
				icon={<SyncIcon />}
				label="REQUEST / REPLY"
				selected={isSyncOpen}
				onClick={handleSyncClick}
			/>
			<RowButton
				icon={<StreamsIcon />}
				label="STREAMS"
				selected={isStreamsOpen}
				onClick={handleStreamsClick}
			/>
			<RowButton style={{ marginBottom: 12 }}
				icon={<BucketsIcon />}
				label="BUCKETS"
				selected={isBucketsOpen}
				onClick={handleBucketsClick}
			/>
		</>}

		<ConnectionDetailForm
			cnnDetailSo={cnnDetailSo}
		/>

	</FrameworkCard>
}

export default CnnDetailView
