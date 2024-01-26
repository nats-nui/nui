import Button from "@/components/buttons/Button"
import { StreamsStore } from "@/stores/stacks/streams"
import { StreamStore } from "@/stores/stacks/streams/detail"
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
	const handleEditClick = async () => streamSo.setReadOnly(false)
	const handleCancelClick = () => {
		streamSo.setReadOnly(true)
		streamSo.restore()
	}
	const handleSaveClick = async () => {
		streamSo.setReadOnly(true)
		streamSo.save()
	}

	// RENDER
	if (streamSa.stream == null) return null
	const isNew = streamSo.isNew()
	const readOnly = streamSa.readOnly
	const variant = streamSo.getColorVar()

	if (isNew) {
		return (
			<Button
				label="CREATE"
				variant={variant}
				onClick={handleSaveClick}
			/>
		)

	} else if (readOnly) {
		return (
			<Button
				label="EDIT"
				variant={variant}
				onClick={handleEditClick}
			/>
		)
	}

	return (<>
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

export default ActionsCmp
