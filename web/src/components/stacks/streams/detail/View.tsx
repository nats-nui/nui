import FrameworkCard from "@/components/FrameworkCard"
import { StreamStore } from "@/stores/stacks/streams/detail"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect } from "react"
import ActionsCmp from "./Actions"
import EditForm from "./EditForm"
import ShowForm from "./ShowForm"
import RowButton from "@/components/buttons/RowButton"
import MessagesIcon from "@/icons/MessagesIcon"



interface Props {
	store?: StreamStore
}

const StreamDetailView: FunctionComponent<Props> = ({
	store: streamSo,
}) => {

	// STORE
	const streamSa = useStore(streamSo)

	// HOOKs
	useEffect(() => {
		streamSo.updateAllStreams()
	}, [])

	// HANDLER
	const handleConsumersClick = () => streamSo.openConsumers()

	// RENDER
	const readOnly = streamSa.readOnly
	const variant = streamSa.colorVar
	const isConsumerSelect = !!streamSa.linked

	return <FrameworkCard
		variantBg={variant}
		store={streamSo}
		actionsRender={<ActionsCmp store={streamSo} />}
	>
		{readOnly ? (<>

				<RowButton
					icon={<MessagesIcon />}
					label="CONSUMERS"
					variant={variant}
					select={isConsumerSelect}
					onClick={handleConsumersClick}
				/>
				<RowButton style={{ marginBottom: 15}}
					icon={<MessagesIcon />}
					label="MESSAGES"
					variant={variant}
					select={isConsumerSelect}
					onClick={handleConsumersClick}
				/>

			<ShowForm store={streamSo} />
		</>) : (
			<EditForm store={streamSo} />
		)}
	</FrameworkCard>
}

export default StreamDetailView
