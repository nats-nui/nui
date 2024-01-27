import FrameworkCard from "@/components/FrameworkCard"
import Button from "@/components/buttons/Button"
import ElementRow from "@/components/rows/ElementRow"
import { StreamsStore } from "@/stores/stacks/streams"
import { StreamInfo } from "@/types/Stream"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect } from "react"



interface Props {
	store?: StreamsStore
}

const StreamsListView: FunctionComponent<Props> = ({
	store: streamsSo,
}) => {

	// STORE
	const streamsSa = useStore(streamsSo)

	// HOOKs
	useEffect(() => {
		streamsSo.fetch()
	}, [])

	// HANDLER
	const handleSelect = (stream: StreamInfo) => streamsSo.select(stream.config.name)
	const handleNew = () => streamsSo.create()
	const handleDel = () => {
		streamsSo.delete(selected)
		streamsSo.select(null)
	}

	// RENDER
	const streams = streamsSa.all
	if (!streams) return null
	const selected = streamsSa.select
	const variant = streamsSa.colorVar
	const isSelected = (stream: StreamInfo) => selected == stream.config.name
	const getTitle = (stream: StreamInfo) => stream.config.name
	const getSubtitle = (stream: StreamInfo) => stream.config.description

	return <FrameworkCard
		store={streamsSo}
		actionsRender={<>

			<Button
				label="NEW"
				//select={bttNewSelect}
				variant={variant}
				onClick={handleNew}
			/>
			<Button
				label="DELETE"
				variant={variant}
				onClick={handleDel}
			/>
		</>}
	>
		{streams.map(stream => (
			<ElementRow key={stream.config.name}
				title={getTitle(stream)}
				subtitle={getSubtitle(stream)}
				selected={isSelected(stream)}
				variant={variant}
				onClick={() => handleSelect(stream)}
			/>
		))}
	</FrameworkCard>
}

export default StreamsListView
