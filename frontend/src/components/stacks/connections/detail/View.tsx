import LinkButton from "@/components/buttons/LinkButton"
import FrameworkCard from "@/components/cards/FrameworkCard"
import RowButton from "@/components/rows/RowButton"
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
import clsGreen from "../../CardGreen.module.css"
import ConnectionIcon from "../../../../icons/cards/ConnectionIcon"
import { IconButton, TooltipWrapCmp } from "@priolo/jack"
import MetricsIcon from "@/icons/cards/MetricsIcon"


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
	const handleMetricsClick = () => cnnDetailSo.openMetrics()
	const handleSendClick = (e: React.MouseEvent) => {
		e.stopPropagation()
		cnnDetailSo.openMessageSend()
	}

	// RENDER
	const isMessageOpen = cnnDetailSo.getMessagesOpen()
	const isSyncOpen = cnnDetailSo.getSyncOpen()
	const isStreamsOpen = cnnDetailSo.getStreamsOpen()
	const isBucketsOpen = cnnDetailSo.getBucketsOpen()
	const isMetricsOpen = cnnDetailSo.getMetricsOpen()
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
				<LinkButton
					className="jack-focus-5"
					icon={<MetricsIcon />}
					tooltip="METRICS"
					selected={isMetricsOpen}
					onClick={handleMetricsClick}
				/>
			</div>
		}
	>
		{inRead && <>
			<RowButton
				className="jack-focus-1"
				icon={<MessagesIcon className="small-icon"/>}
				label="MESSAGES"
				selected={isMessageOpen}
				onClick={handleMessagesClick}
				renderEnd={ButtonSend}
			/>
			<RowButton
				className="jack-focus-2"
				icon={<SyncIcon className="small-icon"/>}
				label="REQUEST / REPLY"
				selected={isSyncOpen}
				onClick={handleSyncClick}
			/>
			<RowButton
				className="jack-focus-3"
				icon={<StreamsIcon className="small-icon"/>}
				label="STREAMS"
				selected={isStreamsOpen}
				onClick={handleStreamsClick}
			/>
			<RowButton
				className="jack-focus-4"
				icon={<BucketsIcon className="small-icon"/>}
				label="BUCKETS"
				selected={isBucketsOpen}
				onClick={handleBucketsClick}
			/>
			<RowButton style={{ marginBottom: 12 }}
				className="jack-focus-5"
				icon={<MetricsIcon className="small-icon"/>}
				label="METRICS"
				selected={isMetricsOpen}
				onClick={handleMetricsClick}
			/>
		</>}

		<ConnectionDetailForm
			cnnDetailSo={cnnDetailSo}
		/>

	</FrameworkCard>
}

export default CnnDetailView
