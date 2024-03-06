import Button from "@/components/buttons/Button"
import FrameworkCard from "@/components/cards/FrameworkCard"
import AlertDialog from "@/components/dialogs/AlertDialog"
import FindInput from "@/components/input/FindInput"
import Table from "@/components/table"
import docSo from "@/stores/docs"
import { StreamsStore } from "@/stores/stacks/streams"
import { StreamStore } from "@/stores/stacks/streams/detail"
import { DOC_TYPE, EDIT_STATE } from "@/types"
import { StreamInfo } from "@/types/Stream"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect, useState } from "react"



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
	const [deleteDialog, setDeleteDialog] = useState(false)
	useEffect(() => {
		streamsSo.fetchIfVoid()
	}, [])

	// HANDLER
	const handleSelect = (stream: StreamInfo) => streamsSo.select(stream?.config?.name)
	const handleNew = () => streamsSo.create()
	const handleDelete = () => setDeleteDialog(true)
	const handleDeleteDialogClose = (ok:boolean) => {
		setDeleteDialog(false)
		if ( ok ) streamsSo.delete()
	}

	// RENDER
	const streams = streamsSo.getFiltered() ?? []
	const nameSelected = streamsSa.select
	const isNewSelect = streamsSa.linked?.state.type == DOC_TYPE.STREAM && (streamsSa.linked as StreamStore).state.editState == EDIT_STATE.NEW
	const variant = streamsSa.colorVar

	return <FrameworkCard styleBody={{ padding: 0, }}
		store={streamsSo}
		actionsRender={<>
			<FindInput
				value={streamsSa.textSearch}
				onChange={text => streamsSo.setTextSearch(text)}
			/>
			{!!nameSelected && <Button
				children="DELETE"
				variant={variant}
				onClick={handleDelete}
			/>}
			<Button
				children="NEW"
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
			selectId={nameSelected}
			onSelectChange={handleSelect}
			getId={item => item.config.name}
			variant={variant}
		/>
		<AlertDialog
			open={deleteDialog}
			title="STREAM DELETION"
			text={"This action is irreversible.\nAre you sure you want to delete the STREAM?"}
			store={streamsSo}
			onClose={handleDeleteDialogClose}
		/>
	</FrameworkCard>
}

export default StreamsListView
