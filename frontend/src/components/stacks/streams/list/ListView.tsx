import FrameworkCard from "@/components/cards/FrameworkCard"
import Button from "@/components/buttons/Button"
import Table from "@/components/table"
import docSo from "@/stores/docs"
import { StreamsStore } from "@/stores/stacks/streams"
import { StreamStore } from "@/stores/stacks/streams/detail"
import { DOC_TYPE, EDIT_STATE } from "@/types"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect } from "react"
import FindInput from "@/components/input/FindInput"



interface Props {
	store?: StreamsStore
}

const StreamsListView: FunctionComponent<Props> = ({
	store: streamsSo,
}) => {

	// STORE
	const streamsSa = useStore(streamsSo)
	const docSa = useStore(docSo)

	// HOOKs
	useEffect(() => {
		streamsSo.fetchIfVoid()
	}, [])

	// HANDLER
	const handleSelect = (index: number) => streamsSo.select(streams[index].config.name)
	const handleNew = () => streamsSo.create()
	const handleDelete = () => streamsSo.delete()

	// RENDER
	const streams = streamsSo.getFiltered() ?? []
	const selected = streamsSa.select
	const selectedIndex = streamsSo.getIndexByName(streamsSa.select)
	const isNewSelect = streamsSa.linked?.state.type == DOC_TYPE.STREAM && (streamsSa.linked as StreamStore).state.editState == EDIT_STATE.NEW
	const variant = streamsSa.colorVar

	return <FrameworkCard styleBody={{ paddingTop: 0 }}
		store={streamsSo}
		actionsRender={<>
			<FindInput
				value={streamsSa.textSearch}
				onChange={text => streamsSo.setTextSearch(text)}
			/>
			{!!selected && <Button
				label="DELETE"
				variant={variant}
				onClick={handleDelete}
			/>}
			<Button
				label="NEW"
				select={isNewSelect}
				variant={variant}
				onClick={handleNew}
			/>
		</>}
	>
		<Table
			items={streams}
			props={[
				{ label: "SIZE", getValue: s => s.state.messages },
				{ label: "FIRST", getValue: s => s.state.firstSeq },
				{ label: "LAST", getValue: s => s.state.lastSeq },
				{ label: "BYTES", getValue: s => s.state.bytes },
			]}
			propMain={{ getValue: s => s.config.name }}
			select={selectedIndex}
			onSelectChange={handleSelect}
			variant={variant}
		/>
	</FrameworkCard>
}

export default StreamsListView
