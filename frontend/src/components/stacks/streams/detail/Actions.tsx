import ConfigIcon from "@/icons/cards/ConfigIcon"
import { StreamStore } from "@/stores/stacks/streams/detail"
import { DOC_TYPE, EDIT_STATE } from "@/types"
import { Button, IconButton, OptionsCmp } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"



interface Props {
	store?: StreamStore
}

const ActionsCmp: FunctionComponent<Props> = ({
	store: streamSo,
}) => {

	// STORE
	const streamSa = useStore(streamSo)

	// HOOKs

	// HANDLER
	const handleEditClick = async () => streamSo.setEditState(EDIT_STATE.EDIT)
	const handleCancelClick = () => streamSo.restore()
	const handleSaveClick = async () => streamSo.save()
	const handleConfigClick = () => streamSo.openJsonConfig()

	// RENDER
	if (streamSa.stream == null) return null

	const configOpen = streamSa.linked?.state.type == DOC_TYPE.JSON_CONFIG

	if (streamSa.editState == EDIT_STATE.NEW) {
		return <>
			<Button
				children="CREATE"
				onClick={handleSaveClick}
			/>
			<IconButton
				select={configOpen}
				onClick={handleConfigClick}
			><ConfigIcon style={{ width: 14, height: 14 }} /></IconButton>
		</>

	} else if (streamSa.editState == EDIT_STATE.READ) {
		return <>
			<OptionsCmp
				style={{ marginLeft: 5 }}
				store={streamSo}
			/>
			<div style={{ flex: 1 }} />
			<Button
				children="EDIT"
				onClick={handleEditClick}
			/>
		</>
	}

	// EDIT
	return <>
		<Button
			children="SAVE"
			onClick={handleSaveClick}
		/>
		<Button
			children="CANCEL"
			onClick={handleCancelClick}
		/>
		<IconButton
			select={configOpen}
			onClick={handleConfigClick}
		><ConfigIcon style={{ width: 14, height: 14 }} /></IconButton>
	</>
}

export default ActionsCmp
