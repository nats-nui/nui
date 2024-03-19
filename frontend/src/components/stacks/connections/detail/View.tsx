import FrameworkCard from "@/components/cards/FrameworkCard"
import BoxV from "@/components/format/BoxV"
import LinkButton from "@/components/buttons/LinkButton"
import RowButton from "@/components/rows/RowButton"
import BucketsIcon from "@/icons/cards/BucketsIcon"
import MessagesIcon from "@/icons/cards/MessagesIcon"
import StreamsIcon from "@/icons/cards/StreamsIcon"
import cnnSo from "@/stores/connections"
import docSo from "@/stores/docs"
import { CnnDetailStore } from "@/stores/stacks/connection/detail"
import { DOC_TYPE, EDIT_STATE } from "@/types"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import ActionsCmp from "./Actions"
import ConnectionDetailForm from "./Form"



interface Props {
	store?: CnnDetailStore
}

const CnnDetailView: FunctionComponent<Props> = ({
	store: cnnDetailSo,
}) => {

	// STORE
	useStore(docSo)
	const cnnDetailSa = useStore(cnnDetailSo)
	const cnnSa = useStore(cnnSo)

	// HOOKs

	// HANDLER
	const handleMessagesClick = () => cnnDetailSo.openMessages()
	const handleStreamsClick = () => cnnDetailSo.openStreams()
	const handleBucketsClick = () => cnnDetailSo.openBuckets()

	// RENDER
	const isMessageOpen = cnnDetailSa.linked?.state.type == DOC_TYPE.MESSAGES
	const isStreamsOpen = cnnDetailSa.linked?.state.type == DOC_TYPE.STREAMS
	const isBucketsOpen = cnnDetailSa.linked?.state.type == DOC_TYPE.BUCKETS
	const isNew = cnnDetailSa.editState == EDIT_STATE.NEW
	const inRead = cnnDetailSa.editState == EDIT_STATE.READ
	const variant = cnnDetailSa.colorVar

	return <FrameworkCard
		store={cnnDetailSo}
		variantBg={variant}
		actionsRender={<ActionsCmp store={cnnDetailSo} />}
		iconizedRender={
			<BoxV style={{ marginTop: 10 }}>
				<LinkButton
					icon={<MessagesIcon />}
					tooltip="MESSAGES"
					selected={isMessageOpen}
					onClick={handleMessagesClick}
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
			</BoxV>
		}
	>
		{inRead &&
			<div style={{ marginBottom: 20 }}>
				<RowButton
					icon={<MessagesIcon />}
					label="MESSAGES"
					selected={isMessageOpen}
					onClick={handleMessagesClick}
				/>
				<RowButton
					icon={<StreamsIcon />}
					label="STREAMS"
					selected={isStreamsOpen}
					onClick={handleStreamsClick}
				/>
				<RowButton
					icon={<BucketsIcon />}
					label="BUCKETS"
					selected={isBucketsOpen}
					onClick={handleBucketsClick}
				/>
			</div>
		}

		<ConnectionDetailForm
			cnnDetailSo={cnnDetailSo}
		/>

	</FrameworkCard>
}

export default CnnDetailView
