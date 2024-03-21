import FrameworkCard from "@/components/cards/FrameworkCard"
import BoxV from "@/components/format/BoxV"
import LinkButton from "@/components/buttons/LinkButton"
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

	return <FrameworkCard variantBg
		store={streamSo}
		actionsRender={<ActionsCmp store={streamSo} />}
		iconizedRender={
			<BoxV style={{ marginTop: 10 }}>
				<LinkButton
					icon={<MessagesIcon />}
					tooltip="MESSAGES"
					selected={isMessagesSelect}
					onClick={handleMessagesClick}
				/>
				<LinkButton
					icon={<ConsumersIcon />}
					tooltip="CONSUMERS"
					selected={isConsumersSelect}
					onClick={handleConsumersClick}
				/>
			</BoxV>
		}
	>
		{inRead ? <>
			<RowButton
				icon={<MessagesIcon />}
				label="MESSAGES"
				selected={isMessagesSelect}
				onClick={handleMessagesClick}
			/>
			<RowButton style={{ marginBottom: 15 }}
				icon={<ConsumersIcon />}
				label="CONSUMERS"
				selected={isConsumersSelect}
				onClick={handleConsumersClick}
			/>
			<ShowForm store={streamSo} />
		</> : (
			<EditForm store={streamSo} />
		)}
	</FrameworkCard>
}

export default StreamDetailView
