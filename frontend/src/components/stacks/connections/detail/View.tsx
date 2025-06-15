import LinkButton from "@/components/buttons/LinkButton"
import FrameworkCard from "@/components/cards/FrameworkCard"
import RowButton from "@/components/rows/RowButton"
import SendIcon from "@/icons/SendIcon"
import SyncIcon from "@/icons/SyncIcon"
import BucketsIcon from "@/icons/cards/BucketsIcon"
import MessagesIcon from "@/icons/cards/MessagesIcon"
import StreamsIcon from "@/icons/cards/StreamsIcon"
import { CnnDetailStore } from "@/stores/stacks/connection/detail"
import { EDIT_STATE } from "@/types"
import { IconButton, TooltipWrapCmp } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import ConnectionIcon from "../../../../icons/cards/ConnectionIcon"
import clsGreen from "../../CardGreen.module.css"
import ActionsCmp from "./Actions"
import ConnectionDetailForm from "./Form"


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

	const ButtonSend = <TooltipWrapCmp content="SEND A MESSAGE" style={{ padding: 5 }}>
		<IconButton onClick={handleSendClick}><SendIcon /></IconButton>
	</TooltipWrapCmp>

	return <FrameworkCard
		className={clsGreen.root}
		icon={<ConnectionIcon />}
		store={cnnDetailSo}
		actionsRender={<ActionsCmp store={cnnDetailSo} />}
		iconizedRender={
			<div className="lyt-v lyt-v-btts">
				<LinkButton
					className="jack-focus-1"
					icon={<MessagesIcon />}
					tooltip="MESSAGES"
					selected={isMessageOpen}
					onClick={handleMessagesClick}
					renderExtra={ButtonSend}
				/>
				<LinkButton
					className="jack-focus-2"
					icon={<SyncIcon />}
					tooltip="REQUEST / REPLY"
					selected={isSyncOpen}
					onClick={handleSyncClick}
				/>
				<LinkButton
					className="jack-focus-3"
					icon={<StreamsIcon />}
					tooltip="STREAMS"
					selected={isStreamsOpen}
					onClick={handleStreamsClick}
				/>
				<LinkButton
					className="jack-focus-4"
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
				className="jack-focus-1"
				icon={<MessagesIcon />}
				label="MESSAGES"
				selected={isMessageOpen}
				onClick={handleMessagesClick}
				renderEnd={ButtonSend}
			/>
			<RowButton
				className="jack-focus-2"
				icon={<SyncIcon />}
				label="REQUEST / REPLY"
				selected={isSyncOpen}
				onClick={handleSyncClick}
			/>
			<RowButton
				className="jack-focus-3"
				icon={<StreamsIcon />}
				label="STREAMS"
				selected={isStreamsOpen}
				onClick={handleStreamsClick}
			/>
			<RowButton style={{ marginBottom: 12 }}
				className="jack-focus-4"
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
