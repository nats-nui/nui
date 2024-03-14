import BoxV from "@/components/format/BoxV"
import Form from "@/components/format/Form"
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
			<div className="lbl-input-readonly">
				{bucket.bucket}
			</div>
		</BoxV>

		<BoxV>
			<div className="lbl-prop">VALUES COUNT</div>
			<div className="lbl-input-readonly">
				{bucket.values}
			</div>
		</BoxV>

		<BoxV>
			<div className="lbl-prop">BYTES COUNT</div>
			<div className="lbl-input-readonly">
				{bucket.bytes}
			</div>
		</BoxV>

		<div className="lbl-prop-title">CONFIG</div>
		<BoxV>
			<div className="lbl-prop">HISTORY</div>
			<div className="lbl-input-readonly">
				{bucket.history}
			</div>
		</BoxV>
		<BoxV>
			<div className="lbl-prop">TTL</div>
			<div className="lbl-input-readonly">
				{bucket.ttl}
			</div>
		</BoxV>
		<BoxV>
			<div className="lbl-prop">BACKING STORE</div>
			<div className="lbl-input-readonly">
				{bucket.backingStore}
			</div>
		</BoxV>
		<BoxV>
			<div className="lbl-prop">COMPRESSION</div>
			<div className="lbl-input-readonly">
				{bucket.compressed ? "YES" : "NO"}
			</div>
		</BoxV>

	</Form>
}

export default ShowForm
