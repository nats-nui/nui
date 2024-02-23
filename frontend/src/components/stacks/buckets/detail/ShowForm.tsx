import BoxV from "@/components/format/BoxV"
import Form from "@/components/format/Form"
import Label from "@/components/format/Label"
import { BucketStore } from "@/stores/stacks/buckets/detail"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"



interface Props {
	store?: BucketStore
}

const ShowForm: FunctionComponent<Props> = ({
	store: bucketSo,
}) => {

	// STORE
	const bucketSa = useStore(bucketSo)

	// HOOKs


	// HANDLER

	// RENDER
	const bucket = bucketSa.bucket
	if (!bucket) return null
	
	return <Form>

		<BoxV>
			<Label>NAME</Label>
			<Label>{bucket.bucket}</Label>
		</BoxV>
		<BoxV>
			<Label>VALUES</Label>
			<Label>{bucket.values}</Label>
		</BoxV>
		<BoxV>
			<Label>HISTORY</Label>
			<Label>{bucket.history}</Label>
		</BoxV>
		<BoxV>
			<Label>TTL</Label>
			<Label>{bucket.ttl}</Label>
		</BoxV>


	</Form>
}

export default ShowForm
