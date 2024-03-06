import Button from "@/components/buttons/Button"
import { BucketStore } from "@/stores/stacks/buckets/detail"
import { EDIT_STATE } from "@/types"
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
	const variant = bucketSa.colorVar

	if (bucketSa.editState == EDIT_STATE.READ) return null

	return (<>
		<Button
			children="CREATE"
			variant={variant}
			onClick={handleSave}
		/>
	</>)
}

export default ActionsCmp
