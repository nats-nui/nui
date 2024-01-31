import FrameworkCard from "@/components/FrameworkCard"
import Button from "@/components/buttons/Button"
import ElementRow from "@/components/rows/ElementRow"
import { buildStore } from "@/stores/docs/utils/factory"
import { StreamsStore } from "@/stores/stacks/streams"
import { StreamMessagesState, StreamMessagesStore } from "@/stores/stacks/streams/messages"
import { DOC_TYPE } from "@/types"
import { StreamInfo } from "@/types/Stream"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect } from "react"
import docSo from "@/stores/docs"



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
	const handleMessages = (e: React.MouseEvent, stream: StreamInfo) => {
		e.stopPropagation()
		const streamMessagesStore = buildStore({
			type: DOC_TYPE.STREAM_MESSAGES,
			connectionId: streamsSo.state.connectionId,
			stream: stream,
			subjects: [...(stream?.config?.subjects ?? [])]
		} as StreamMessagesState) as StreamMessagesStore
		docSo.addLink({
			view: streamMessagesStore,
			parent: streamsSo,
			anim: true,
		})
	}
	const handleConsumer = (e: React.MouseEvent, stream: StreamInfo) => {
		e.stopPropagation()
		// const msgStore = buildStore({
		// 	type: DOC_TYPE.STREAMS,
		// 	connectionId: cnn.id,
		// } as StreamsState) as StreamsStore
		// docSo.addLink({
		// 	view: msgStore,
		// 	parent: cnnListSo,
		// 	anim: true,
		// })
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
				testRender={<>
					<Button label="Messages" onClick={(e) => handleMessages(e, stream)} />
					<Button label="Consumer" onClick={(e) => handleConsumer(e, stream)} />
				</>}
			/>
		))}
	</FrameworkCard>
}

export default StreamsListView
