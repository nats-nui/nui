import Button from "@/components/buttons/Button"
import OptionsCmp from "@/components/loaders/OptionsCmp"
import { MESSAGE_TYPE } from "@/stores/log/utils"
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
	const handleSaveClick = async () => streamSo.save()

	// RENDER
	if (streamSa.stream == null) return null
	if (streamSa.editState == EDIT_STATE.NEW) {
		return (
			<Button
				children="CREATE"
				onClick={handleSaveClick}
			/>
		)

	} else if (streamSa.editState == EDIT_STATE.READ) {
		return <>
			<OptionsCmp
				style={{ marginLeft: 5 }}
				store={streamSo}
			/>
			<div style={{ flex: 1}} />
			<Button
				children="EDIT"
				onClick={handleEditClick}
			/>
		</>
	}

	// EDIT
	return (<>
		<Button
			children="SAVE"
			onClick={handleSaveClick}
		/>
		<Button
			children="CANCEL"
			onClick={handleCancelClick}
		/>
	</>)
}

export default ActionsCmp
