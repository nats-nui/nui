import Button from "@/components/buttons/Button"
import CircularLoadingCmp from "@/components/loaders/CircularLoadingCmp"
import cnnSo from "@/stores/connections"
import { MESSAGE_TYPE } from "@/stores/log/utils"
import { CnnListStore } from "@/stores/stacks/connection"
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
	useStore(cnnDetailSo.state.group)
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
		cnnDetailSo.setDisabled(true)
		const cnnNew = await cnnSo.save(cnnDetailSa.connection);
		(cnnDetailSa.parent as CnnListStore)?.setSelect(cnnNew.id)		
		cnnDetailSo.setDisabled(false)
		cnnDetailSo.setConnection(cnnNew)
		cnnDetailSo.setEditState(EDIT_STATE.READ)
		cnnDetailSo.setSnackbar({ open: true,
			type: MESSAGE_TYPE.SUCCESS,
			title: "SAVED",
			body: "If the dot is green you are online",
			timeout: 5000,
		})
	}


	// LOADING
	if (cnnDetailSa.disabled) {
		return <CircularLoadingCmp style={{ width: 25, height: 25, color: "rgba(0,0,0,.5)" }} />
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
