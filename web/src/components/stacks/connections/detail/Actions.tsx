import Button from "@/components/buttons/Button"
import cnnSo from "@/stores/connections"
import docSo from "@/stores/docs"
import { CnnDetailStore } from "@/stores/stacks/connection/detail"
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
	const handleEditClick = async () => cnnDetailSo.setReadOnly(false)
	const handleCancelClick = () => {
		cnnDetailSo.setReadOnly(true)
		cnnDetailSo.restore()
	}
	const handleSaveClick = async () => {
		cnnDetailSo.setReadOnly(true)
		await cnnSo.save(cnnDetailSa.connection)
	}

	// RENDER
	const isNew = cnnDetailSa.connection?.id == null
	const readOnly = cnnDetailSa.readOnly
	const variant = cnnDetailSa.colorVar

	return isNew ? (
		<Button
			label="CREATE"
			variant={variant}
			onClick={handleSaveClick}
		/>
	) : readOnly ? (
		<Button
			label="EDIT"
			variant={variant}
			onClick={handleEditClick}
		/>
	) : (<>
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

export default ConnectionDetailActions
