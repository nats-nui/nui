import Button from "@/components/buttons/Button"
import { BucketStore } from "@/stores/stacks/buckets/detail"
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
	const handleSave = () => bucketSo.save()

	// RENDER
	if (!bucketSo.isNew()) return null
	const variant = bucketSa.colorVar

	return (<>
		<Button
			label="CREATE"
			variant={variant}
			onClick={handleSave}
		/>
	</>)
}

export default ActionsCmp
