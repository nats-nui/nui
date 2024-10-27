import { BucketStore } from "@/stores/stacks/buckets/detail"
import { EDIT_STATE } from "@/types"
import { Button, OptionsCmp } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"



interface Props {
	store?: BucketStore
}

const ActionsCmp: FunctionComponent<Props> = ({
	store: bucketSo,
}) => {

	// STORE
	const bucketSa = useStore(bucketSo)

	// HOOKs

	// HANDLER
	const handleEditClick = async () => bucketSo.setEditState(EDIT_STATE.EDIT)
	const handleCancelClick = () => bucketSo.restore()
	const handleSaveClick = async () => bucketSo.save()

	// RENDER
	
	if (bucketSa.editState == EDIT_STATE.NEW) {
		return (
			<Button
				children="CREATE"
				onClick={handleSaveClick}
			/>
		)

	} else if (bucketSa.editState == EDIT_STATE.READ) {
		return <>
			<OptionsCmp
				style={{ marginLeft: 5 }}
				store={bucketSo}
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
