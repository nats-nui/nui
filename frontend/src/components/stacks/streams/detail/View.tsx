import LinkButton from "@/components/buttons/LinkButton"
import FrameworkCard from "@/components/cards/FrameworkCard"
import RowButton from "@/components/rows/RowButton"
import ConsumersIcon from "@/icons/cards/ConsumersIcon"
import MessagesIcon from "@/icons/cards/MessagesIcon"
import StreamIcon from "@/icons/cards/StreamIcon"
import { StreamStore } from "@/stores/stacks/streams/detail"
import { EDIT_STATE } from "@/types"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect } from "react"
import clsCardRedeye from "../../CardYellow.module.css"
import clsCardBoring from "../../CardBoringDef.module.css"
import ActionsCmp from "./Actions"
import Form from "./Form"
import layoutSo from "@/stores/layout"



interface Props {
	store?: StreamStore
}

const StreamDetailView: FunctionComponent<Props> = ({
	store: streamSo,
}) => {

	// STORE
	const streamSa = useStore(streamSo)
	useStore(streamSo.state.group)
	useStore(layoutSo)

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
	const clsCard = layoutSo.state.theme == "redeye" ? clsCardRedeye : clsCardBoring

	return <FrameworkCard
		className={clsCard.root}
		icon={<StreamIcon />}
		store={streamSo}
		actionsRender={<ActionsCmp store={streamSo} />}
		iconizedRender={
			<div className="lyt-v lyt-v-btts">
				<LinkButton
					icon={<MessagesIcon />}
					tooltip="MESSAGES"
					className="jack-focus-1"
					selected={isMessagesSelect}
					onClick={handleMessagesClick}
				/>
				<LinkButton
					icon={<ConsumersIcon />}
					tooltip="CONSUMERS"
					className="jack-focus-2"
					selected={isConsumersSelect}
					onClick={handleConsumersClick}
				/>
			</div>
		}
	>
		{inRead && <>
			<RowButton
				icon={<MessagesIcon className="small-icon"/>}
				label="MESSAGES"
				className="jack-focus-1"
				selected={isMessagesSelect}
				onClick={handleMessagesClick}
			/>
			<RowButton style={{ marginBottom: 13 }}
				icon={<ConsumersIcon className="small-icon"/>}
				label="CONSUMERS"
				className="jack-focus-2"
				selected={isConsumersSelect}
				onClick={handleConsumersClick}
			/>

		</>}

		<Form store={streamSo} />

	</FrameworkCard>
}

export default StreamDetailView
