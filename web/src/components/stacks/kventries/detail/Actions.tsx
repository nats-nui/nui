import Button from "@/components/buttons/Button"
import { KVEntryStore } from "@/stores/stacks/kventry/detail"
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
	const handleEdit = () => kventrySo.setReadOnly(false)
	const handleSave = () => kventrySo.save()
	const handleCancel = () => kventrySo.restore()

	// RENDER
	const variant = kventrySa.colorVar
	const label = kventrySa.isNew ? "CREATE" : "SAVE"

	if (kventrySa.readOnly) return <Button
		label="EDIT"
		variant={variant}
		onClick={handleEdit}
	/>

	return (<>
		<Button
			label={label}
			variant={variant}
			onClick={handleSave}
		/>
		{!kventrySa.isNew && (
			<Button
				label="CANCEL"
				variant={variant}
				onClick={handleCancel}
			/>
		)}
	</>)
}

export default ActionsCmp
