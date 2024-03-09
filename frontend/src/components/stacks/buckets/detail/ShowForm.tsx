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
		<div className="lbl-prop-title">BUCKET</div>

		<BoxV>
			<div className="lbl-prop">NAME</div>
			<Label>{bucket.bucket}</Label>
		</BoxV>

		<BoxV>
			<div className="lbl-prop">VALUES COUNT</div>
			<Label>{bucket.values}</Label>
		</BoxV>

		<BoxV>
			<div className="lbl-prop">BYTES COUNT</div>
			<Label>{bucket.bytes}</Label>
		</BoxV>

		<div className="lbl-prop-title">CONFIG</div>
		<BoxV>
			<Label>HISTORY</Label>
			<Label>{bucket.history}</Label>
		</BoxV>
		<BoxV>
			<div className="lbl-prop">TTL</div>
			<Label>{bucket.ttl}</Label>
		</BoxV>
		<BoxV>
			<div className="lbl-prop">BACKING STORE</div>
			<Label>{bucket.backingStore}</Label>
		</BoxV>
		<BoxV>
			<div className="lbl-prop">COMPRESSION</div>
			<Label>{bucket.compressed ? "YES" : "NO"}</Label>
		</BoxV>

	</Form>
}

export default ShowForm
