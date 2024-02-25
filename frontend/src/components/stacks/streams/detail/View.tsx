import FrameworkCard from "@/components/cards/FrameworkCard"
import BoxV from "@/components/format/BoxV"
import IconRow2 from "@/components/rows/IconRow2"
import RowButton from "@/components/rows/RowButton"
import ConsumersIcon from "@/icons/cards/ConsumersIcon"
import MessagesIcon from "@/icons/cards/MessagesIcon"
import docSo from "@/stores/docs"
import { StreamStore } from "@/stores/stacks/streams/detail"
import { DOC_TYPE, EDIT_STATE } from "@/types"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect } from "react"
import ActionsCmp from "./Actions"
import EditForm from "./EditForm"
import ShowForm from "./ShowForm"



interface Props {
	store?: StreamStore
}

const StreamDetailView: FunctionComponent<Props> = ({
	store: streamSo,
}) => {

	// STORE
	const streamSa = useStore(streamSo)
	const docSa = useStore(docSo)

	// HOOKs
	useEffect(() => {
		streamSo.fetchIfVoid()
	}, [])

	// HANDLER
	const handleConsumersClick = () => streamSo.openConsumers()
	const handleMessagesClick = () => streamSo.openMessages()

	// RENDER
	const inRead = streamSa.editState == EDIT_STATE.READ
	const isConsumersSelect = streamSa.linked?.state.type == DOC_TYPE.CONSUMERS
	const isMessagesSelect = streamSa.linked?.state.type == DOC_TYPE.STREAM_MESSAGES
	const variant = streamSa.colorVar

	return <FrameworkCard
		variantBg={variant}
		store={streamSo}
		actionsRender={<ActionsCmp store={streamSo} />}
		iconizedRender={
			<BoxV style={{ marginTop: 10 }}>
				<IconRow2
					icon={<MessagesIcon />}
					tooltip="MESSAGES"
					selected={isMessagesSelect}
					variant={variant}
					onClick={handleMessagesClick}
				/>
				<IconRow2
					icon={<ConsumersIcon />}
					tooltip="CONSUMERS"
					selected={isConsumersSelect}
					variant={variant}
					onClick={handleConsumersClick}
				/>
			</BoxV>
		}
	>
		{inRead ? (<>
			<RowButton
				icon={<MessagesIcon />}
				label="MESSAGES"
				variant={variant}
				selected={isMessagesSelect}
				onClick={handleMessagesClick}
			/>
			<RowButton style={{ marginBottom: 15 }}
				icon={<ConsumersIcon />}
				label="CONSUMERS"
				variant={variant}
				selected={isConsumersSelect}
				onClick={handleConsumersClick}
			/>
			<ShowForm store={streamSo} />
		</>) : (
			<EditForm store={streamSo} />
		)}
	</FrameworkCard>
}

export default StreamDetailView
