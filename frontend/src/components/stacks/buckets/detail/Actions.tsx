import { BucketStore } from "@/stores/stacks/buckets/detail"
import { DOC_TYPE, EDIT_STATE } from "@/types"
import { Button, IconButton, OptionsCmp } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import ConfigIcon from "../../../../icons/cards/ConfigIcon"



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
	const handleConfigClick = () => bucketSo.openJsonConfig()

	// RENDER
	const configOpen = bucketSa.linked?.state.type == DOC_TYPE.JSON_CONFIG
	
	if (bucketSa.editState == EDIT_STATE.NEW) {
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
