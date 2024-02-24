import FrameworkCard from "@/components/cards/FrameworkCard"
import RowButton from "@/components/buttons/RowButton"
import BoxV from "@/components/format/BoxV"
import IconRow from "@/components/rows/IconRow"
import docSo from "@/stores/docs"
import { StreamStore } from "@/stores/stacks/streams/detail"
import { DOC_TYPE, EDIT_STATE } from "@/types"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect } from "react"
import ActionsCmp from "./Actions"
import EditForm from "./EditForm"
import ShowForm from "./ShowForm"
import MessagesIcon from "@/icons/cards/MessagesIcon"



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
			<BoxV style={{ gap: 5, marginTop: 5 }}>
				<IconRow
					title="CONSUMERS"
					selected={isConsumersSelect}
					variant={variant}
					onClick={handleConsumersClick}
				/>
				<IconRow
					title="MESSAGES"
					selected={isMessagesSelect}
					variant={variant}
					onClick={handleMessagesClick}
				/>
			</BoxV>
		}
	>
		{inRead ? (<>
			<RowButton
				icon={<MessagesIcon />}
				label="CONSUMERS"
				variant={variant}
				selected={isConsumersSelect}
				onClick={handleConsumersClick}
			/>
			<RowButton style={{ marginBottom: 15 }}
				icon={<MessagesIcon />}
				label="MESSAGES"
				variant={variant}
				selected={isMessagesSelect}
				onClick={handleMessagesClick}
			/>
			<ShowForm store={streamSo} />
		</>) : (
			<EditForm store={streamSo} />
		)}
	</FrameworkCard>
}

export default StreamDetailView
