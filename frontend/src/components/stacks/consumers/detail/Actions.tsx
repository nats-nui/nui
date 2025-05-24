import { DOC_TYPE, EDIT_STATE } from "@/types"
import { Button, IconButton, OptionsCmp } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import ConfigIcon from "../../../../icons/cards/ConfigIcon"
import { ConsumerStore } from "../../../../stores/stacks/consumer/detail"



interface Props {
	store?: ConsumerStore
}

const ActionsCmp: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	const state = useStore(store)

	// HOOKs

	// HANDLER
	const handleEditClick = async () => store.setEditState(EDIT_STATE.EDIT)
	const handleCancelClick = () => store.restore()
	const handleSaveClick = async () => store.save()
	const handleConfigClick = () => store.openJsonConfig()
	const handlePauseClick = (e: React.MouseEvent, select: boolean) => store.setPauseOpen(!select)

	// RENDER
	if (state.consumer == null) return null
	const configOpen = state.linked?.state.type == DOC_TYPE.JSON_CONFIG
	if (state.editState == EDIT_STATE.NEW) {
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

	} else if (state.editState == EDIT_STATE.READ) {
		return <>
			<OptionsCmp
				style={{ marginLeft: 5 }}
				store={store}
			/>
			<div style={{ flex: 1 }} />
			<Button
				children="EDIT"
				onClick={handleEditClick}
			/>
			<Button
				select={store.state.pauseOpen}
				children={state.consumer.paused ? "RESUME" : "PAUSE"}
				onClick={handlePauseClick}
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
