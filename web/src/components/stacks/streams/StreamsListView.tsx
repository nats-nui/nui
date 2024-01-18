import FrameworkCard from "@/components/FrameworkCard"
import Button from "@/components/buttons/Button"
import ElementRow from "@/components/rows/ElementRow"
import { StreamsStore } from "@/stores/stacks/streams"
import { Stream } from "@/types/Stream"
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
	const handleSelect = (stream: Stream) => streamsSo.select(stream)
	const handleNew = () => streamsSo.create()
	const handleDel = () => {
		streamsSo.delete(selectedId)
		streamsSo.select(null)
	}

	// RENDER
	const streams = streamsSa.all
	if (!streams) return null
	const selectedId = streamsSa.selectId
	const variant = streamsSo.getColorVar()
	const isSelected = (stream: Stream) => selectedId == stream.id
	const getTitle = (stream: Stream) => stream.name
	const getSubtitle = (stream: Stream) => stream.description

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
			<ElementRow key={stream.id}
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
