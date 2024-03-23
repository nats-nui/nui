import Button from "@/components/buttons/Button"
import cnnSo from "@/stores/connections"
import docSo from "@/stores/docs"
import { MESSAGE_TYPE } from "@/stores/log/utils"
import { CnnDetailStore } from "@/stores/stacks/connection/detail"
import { EDIT_STATE } from "@/types"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"



interface Props {
	store: CnnDetailStore
}

const ConnectionDetailActions: FunctionComponent<Props> = ({
	store: cnnDetailSo,
}) => {

	// STORE
	useStore(docSo)
	const cnnDetailSa = useStore(cnnDetailSo)
	const cnnSa = useStore(cnnSo)

	// HOOKs

	// HANDLER
	const handleEditClick = async () => {
		cnnDetailSo.restore()
		cnnDetailSo.setEditState(EDIT_STATE.EDIT)
	}
	const handleCancelClick = () => {
		cnnDetailSo.restore()
		cnnDetailSo.setEditState(EDIT_STATE.READ)
	}
	const handleSaveClick = async () => {
		const cnnNew = await cnnSo.save(cnnDetailSa.connection)
		cnnDetailSo.setConnection(cnnNew)
		cnnDetailSo.setEditState(EDIT_STATE.READ)
	}

	// RENDER
	if (cnnDetailSa.editState == EDIT_STATE.NEW) {
		return <Button
			children="CREATE"
			onClick={handleSaveClick}
		/>

	} else if (cnnDetailSa.editState == EDIT_STATE.READ) {
		return <Button
			children="EDIT"
			onClick={handleEditClick}
		/>
	}

	return <>
		<Button
			children="SAVE"
			onClick={handleSaveClick}
		/>
		<Button
			children="CANCEL"
			onClick={handleCancelClick}
		/>
	</>
}

export default ConnectionDetailActions
