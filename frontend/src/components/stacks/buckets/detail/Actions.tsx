import { BucketStore } from "@/stores/stacks/buckets/detail"
import { EDIT_STATE } from "@/types"
import { Button, OptionsCmp } from "@priolo/jack"
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

	if (bucketSa.editState == EDIT_STATE.READ) return <>
		<OptionsCmp
			style={{ marginLeft: 5 }}
			store={bucketSo}
		/>
		<div style={{ flex: 1 }} />
	</>

	return (<>
		<Button
			children="CREATE"
			onClick={handleSave}
		/>
	</>)
}

export default ActionsCmp
