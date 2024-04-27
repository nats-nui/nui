import Button from "@/components/buttons/Button"
import FrameworkCard from "@/components/cards/FrameworkCard"
import AlertDialog from "@/components/dialogs/AlertDialog"
import FindInputHeader from "@/components/input/FindInputHeader"
import OptionsCmp from "@/components/loaders/OptionsCmp"
import PurgeDialog from "@/components/stacks/streams/list/PurgeDialog.tsx"
import Table from "@/components/table"
import { StreamsStore } from "@/stores/stacks/streams"
import { StreamStore } from "@/stores/stacks/streams/detail"
import { DOC_TYPE, EDIT_STATE } from "@/types"
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
	useStore(streamsSo.state.group)

	// HOOKs
	useEffect(() => {
		streamsSo.fetchIfVoid()
	}, [])

	// HANDLER
	const handleSelect = (stream: StreamInfo) => streamsSo.select(stream?.config?.name)
	const handlePurgeClick = () => streamsSo.setPurgeOpen(true)
	const handleNew = () => streamsSo.create()
	const handleDelete = () => streamsSo.delete()

	// RENDER
	const streams = streamsSo.getFiltered() ?? []
	const nameSelected = streamsSa.select
	const isNewSelect = streamsSa.linked?.state.type == DOC_TYPE.STREAM && (streamsSa.linked as StreamStore).state.editState == EDIT_STATE.NEW

	return <FrameworkCard styleBody={{ padding: 0, }}
		store={streamsSo}
		actionsRender={<>
			<OptionsCmp
				style={{ marginLeft: 5, backgroundColor: "rgba(255,255,255,.4)" }}
				store={streamsSo}
			/>
			<FindInputHeader
				value={streamsSa.textSearch}
				onChange={text => streamsSo.setTextSearch(text)}
			/>
			{!!nameSelected && <Button
				children="DELETE"
				onClick={handleDelete}
			/>}
			{!!nameSelected && <Button
				children="PURGE"
				onClick={handlePurgeClick}
			/>}
			{!!nameSelected && <div> | </div>}
			<Button
				children="NEW"
				select={isNewSelect}
				onClick={handleNew}
			/>
		</>}
	>
		<Table
			items={streams}
			props={[
				{ label: "NAME", getValue: s => s.config.name, isMain: true },
				{ label: "SIZE", getValue: s => s.state.messages },
				{ label: "FIRST", getValue: s => s.state.firstSeq },
				{ label: "LAST", getValue: s => s.state.lastSeq },
				{ label: "BYTES", getValue: s => s.state.bytes },
			]}
			selectId={nameSelected}
			onSelectChange={handleSelect}
			getId={item => item.config.name}
			singleRow={streamsSo.getWidth() > 430}
		/>

		<PurgeDialog store={streamsSo} />

		<AlertDialog store={streamsSo} />

	</FrameworkCard>
}

export default StreamsListView
