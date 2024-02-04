import FrameworkCard from "@/components/FrameworkCard"
import RowButton from "@/components/buttons/RowButton"
import DatabaseIcon from "@/icons/DatabaseIcon"
import MessagesIcon from "@/icons/MessagesIcon"
import SettingsIcon from "@/icons/SettingsIcon"
import cnnSo from "@/stores/connections"
import docSo from "@/stores/docs"
import { CnnDetailStore } from "@/stores/stacks/connection/detail"
import { DOC_TYPE } from "@/types"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import ActionsCmp from "./Actions"
import ConnectionDetailForm from "./Form"
import BoxV from "@/components/format/BoxV"
import IconRow from "@/components/rows/IconRow"



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
	const isNew = cnnDetailSa.connection?.id == null
	const readOnly = cnnDetailSa.readOnly
	const variant = cnnDetailSa.colorVar

	return <FrameworkCard
		store={cnnDetailSo}
		variantBg={variant}
		actionsRender={<ActionsCmp store={cnnDetailSo} />}
		iconizedRender={
			<BoxV style={{ gap: 5, marginTop: 5 }}>
				<IconRow
					title="MESSAGES"
					selected={isMessageOpen}
					variant={variant}
					onClick={handleMessagesClick}
				/>
				<IconRow
					title="STREAMS"
					selected={isStreamsOpen}
					variant={variant}
					onClick={handleStreamsClick}
				/>
				<IconRow
					title="BUCKETS"
					variant={variant}
					onClick={handleBucketsClick}
				/>
			</BoxV>
		}

	>
		{!isNew && <div style={{ marginBottom: 20 }}>
			<RowButton
				icon={<MessagesIcon />}
				label="MESSAGES"
				variant={variant}
				selected={isMessageOpen}
				onClick={handleMessagesClick}
			/>
			<RowButton
				icon={<DatabaseIcon />}
				label="STREAMS"
				variant={variant}
				selected={isStreamsOpen}
				onClick={handleStreamsClick}
			/>
			<RowButton
				icon={<SettingsIcon />}
				variant={variant}
				label="BUCKETS"
				selected={isBucketsOpen}
				onClick={handleBucketsClick}
			/>
		</div>}

		<ConnectionDetailForm
			cnnDetailSo={cnnDetailSo}
		/>

	</FrameworkCard>
}

export default CnnDetailView
