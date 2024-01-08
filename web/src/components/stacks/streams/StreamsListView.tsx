import FrameworkCard from "@/components/FrameworkCard"
import Button from "@/components/buttons/Button"
import CnnRow from "@/components/rows/CnnRow"
import { StreamsStore } from "@/stores/stacks/streams"
import { Stream } from "@/types/Stream"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect } from "react"



interface Props {
	store?: StreamsStore
}

const StreamsListView: FunctionComponent<Props> = ({
	store: strSo,
}) => {

	// STORE
	const strSa = useStore(strSo)

	// HOOKs
	useEffect(() => {
		strSo.fetch()
	}, [])

	// HANDLER
	const handleSelect = (stream: Stream) => strSo.select(stream)
	const handleSelect2 = (stream: Stream) => strSo.select2(stream)
	const handleNew = () => {
		//		cnnListSo.create()
	}
	const handleDel = () => {
		//		cnnSo.delete(selectedId)
		//		cnnListSo.select(null)
	}

	// RENDER
	const streams = strSa.all
	if (!streams) return null
	const selectedId = strSa.selectId
	const variant = strSo.getColorVar()
	const isSelected = (stream: Stream) => selectedId == stream.id
	const getTitle = (stream: Stream) => stream.name
	const getSubtitle = (stream: Stream) => stream.description

	return <FrameworkCard
		store={strSo}
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
			<CnnRow key={stream.id}
				title={getTitle(stream)}
				subtitle={getSubtitle(stream)}
				selected={isSelected(stream)}
				variant={variant}
				onClick={(e) => {
					if (e.shiftKey) handleSelect2(stream); else handleSelect(stream)
				}}
			/>
		))}
	</FrameworkCard>
}

export default StreamsListView
