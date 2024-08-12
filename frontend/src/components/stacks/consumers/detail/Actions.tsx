import { MESSAGE_TYPE } from "@/stores/log/utils"
import { StreamStore } from "@/stores/stacks/streams/detail"
import { EDIT_STATE } from "@/types"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import { ConsumerStore } from "../../../../stores/stacks/consumer/detail"
import { Button, OptionsCmp } from "@priolo/jack"



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

	// RENDER
	if (state.consumer == null) return null
	if (state.editState == EDIT_STATE.NEW) {
		return (
			<Button
				children="CREATE"
				onClick={handleSaveClick}
			/>
		)

	} else if (state.editState == EDIT_STATE.READ) {
		return <>
			<OptionsCmp
				style={{ marginLeft: 5 }}
				store={store}
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
