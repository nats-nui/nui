import Button from "@/components/buttons/Button"
import { KVEntryStore } from "@/stores/stacks/kventry/detail"
import { EDIT_STATE } from "@/types"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"



interface Props {
	store?: KVEntryStore
}

const ActionsCmp: FunctionComponent<Props> = ({
	store: kventrySo,
}) => {

	// STORE
	const kventrySa = useStore(kventrySo)

	// HOOKs

	// HANDLER
	const handleEdit = () => kventrySo.setEditState(EDIT_STATE.EDIT)
	const handleSave = () => kventrySo.save()
	const handleCancel = () => kventrySo.restore()
	const handleHistoryOpen = () => {
		kventrySo.fetch()
		kventrySo.setHistoryOpen(true)
	}

	// RENDER
	const variant = kventrySa.colorVar

	if (kventrySa.editState == EDIT_STATE.READ) return <>
		<Button
			label="HISTORY"
			variant={variant}
			onClick={handleHistoryOpen}
		/>
		<Button
			label="EDIT"
			variant={variant}
			onClick={handleEdit}
		/>
	</>



	const inNew = kventrySa.editState == EDIT_STATE.NEW
	const label = inNew ? "CREATE" : "SAVE"

	return (<>
		<Button
			label={label}
			variant={variant}
			onClick={handleSave}
		/>
		{!inNew && (
			<Button
				label="CANCEL"
				variant={variant}
				onClick={handleCancel}
			/>
		)}
	</>)
}

export default ActionsCmp
