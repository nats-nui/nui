import Button from "@/components/buttons/Button"
import { BucketStore } from "@/stores/stacks/buckets/detail"
import { StreamsStore } from "@/stores/stacks/streams"
import { StreamStore } from "@/stores/stacks/streams/detail"
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
	const handleEditClick = async () => bucketSo.setReadOnly(false)
	const handleCancelClick = () => {
		bucketSo.setReadOnly(true)
		bucketSo.restore()
	}
	const handleSaveClick = async () => {
		bucketSo.setReadOnly(true)
		bucketSo.save()
	}

	// RENDER
	if (bucketSa.bucketConfig == null) return null
	const readOnly = bucketSa.readOnly
	const variant = bucketSa.colorVar

	return (
		<Button
			label="CREATE"
			variant={variant}
			onClick={handleSaveClick}
		/>
	)
}

export default ActionsCmp
