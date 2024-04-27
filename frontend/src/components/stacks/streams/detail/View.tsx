import LinkButton from "@/components/buttons/LinkButton"
import FrameworkCard from "@/components/cards/FrameworkCard"
import RowButton from "@/components/rows/RowButton"
import ConsumersIcon from "@/icons/cards/ConsumersIcon"
import MessagesIcon from "@/icons/cards/MessagesIcon"
import { StreamStore } from "@/stores/stacks/streams/detail"
import { EDIT_STATE } from "@/types"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect } from "react"
import ActionsCmp from "./Actions"
import Form from "./Form"



interface Props {
	store?: StreamStore
}

const StreamDetailView: FunctionComponent<Props> = ({
	store: streamSo,
}) => {

	// STORE
	const streamSa = useStore(streamSo)
	useStore(streamSo.state.group)

	// HOOKs
	useEffect(() => {
		streamSo.fetchIfVoid()
	}, [])

	// HANDLER
	const handleConsumersClick = () => streamSo.toggleConsumer()
	const handleMessagesClick = () => streamSo.toggleMessages()

	// RENDER
	const inRead = streamSa.editState == EDIT_STATE.READ
	const isConsumersSelect = streamSo.getConsumerOpen()
	const isMessagesSelect = streamSo.getMessagesOpen()

	return <FrameworkCard variantBg
		store={streamSo}
		actionsRender={<ActionsCmp store={streamSo} />}
		iconizedRender={
			<div className="lyt-v lyt-v-btts">
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
			</div>
		}
	>
		{inRead && <>
			<RowButton
				icon={<MessagesIcon />}
				label="MESSAGES"
				selected={isMessagesSelect}
				onClick={handleMessagesClick}
			/>
			<RowButton style={{ marginBottom: 13 }}
				icon={<ConsumersIcon />}
				label="CONSUMERS"
				selected={isConsumersSelect}
				onClick={handleConsumersClick}
			/>
			
		</>}

		<Form store={streamSo} />

	</FrameworkCard>
}

export default StreamDetailView
