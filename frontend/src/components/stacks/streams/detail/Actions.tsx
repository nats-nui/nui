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
	const handleCancelClick = () => streamSo.restore()
	const handleSaveClick = () => streamSo.save()

	// RENDER
	if (streamSa.stream == null) return null
	const variant = streamSa.colorVar

	if (streamSa.editState == EDIT_STATE.NEW) {
		return (
			<Button
				children="CREATE"
				variant={variant}
				onClick={handleSaveClick}
			/>
		)

	} else if (streamSa.editState == EDIT_STATE.READ) {
		return (
			<Button
				children="EDIT"
				variant={variant}
				onClick={handleEditClick}
			/>
		)
	}

	// EDIT
	return (<>
		<Button
			children="SAVE"
			variant={variant}
			onClick={handleSaveClick}
		/>
		<Button
			children="CANCEL"
			variant={variant}
			onClick={handleCancelClick}
		/>
	</>)
}

export default ActionsCmp
