import Button from "@/components/buttons/Button"
import { StreamStore } from "@/stores/stacks/streams/detail"
import { EDIT_STATE } from "@/types"
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
	const handleCancelClick = () => {
		streamSo.restore()
		streamSo.setEditState(EDIT_STATE.READ)
	}
	const handleSaveClick = async () => {
		await streamSo.save()
		streamSo.setEditState(EDIT_STATE.READ)
	}

	// RENDER
	if (streamSa.stream == null) return null
	const variant = streamSa.colorVar

	if (streamSa.editState == EDIT_STATE.NEW) {
		return (
			<Button
				label="CREATE"
				variant={variant}
				onClick={handleSaveClick}
			/>
		)

	} else if (streamSa.editState == EDIT_STATE.READ) {
		return (
			<Button
				label="EDIT"
				variant={variant}
				onClick={handleEditClick}
			/>
		)
	}

	return (<>
		<Button
			label="SAVE"
			variant={variant}
			onClick={handleSaveClick}
		/>
		<Button
			label="CANCEL"
			variant={variant}
			onClick={handleCancelClick}
		/>
	</>)
}

export default ActionsCmp
