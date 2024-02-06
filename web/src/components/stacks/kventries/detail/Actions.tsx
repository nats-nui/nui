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
	const handleSaveClick = async () => {
		kventrySo.setReadOnly(true)
		kventrySo.save()
	}

	// RENDER
	if (kventrySa.bucketConfig == null) return null
	const variant = kventrySa.colorVar

	return (
		<Button
			label="CREATE"
			variant={variant}
			onClick={handleSaveClick}
		/>
	)
}

export default ActionsCmp
