import TitleAccordion from "@/components/accordion/TitleAccordion"
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

	return <div className="lyt-form">

		<TitleAccordion title="BASE">

			<div className="lyt-h-props">
				<div className="item">
					<div className="lbl-prop">VALUES</div>
					<div className="lbl-readonly">
						{bucket.values}
					</div>
				</div>
				<div className="lbl-divider-v" />
				<div className="item">
					<div className="lbl-prop">BYTES</div>
					<div className="lbl-readonly">
						{bucket.bytes}
					</div>
				</div>
			</div>

			<div className="lyt-v">
				<div className="lbl-prop">NAME</div>
				<div className="lbl-readonly">
					{bucket.bucket}
				</div>
			</div>



		</TitleAccordion>


		<TitleAccordion title="CONFIG">

			<div className="lyt-h-props">
				<div className="item">
					<div className="lbl-prop">HISTORY</div>
					<div className="lbl-readonly">
						{bucket.history}
					</div>
				</div>
				<div className="lbl-divider-v" />
				<div className="item">
					<div className="lbl-prop">TTL</div>
					<div className="lbl-readonly">
						{bucket.ttl}
					</div>
				</div>
			</div>

			<div className="lyt-v">
				<div className="lbl-prop">BACKING STORE</div>
				<div className="lbl-readonly">
					{bucket.backingStore}
				</div>
			</div>

			<div className="lyt-v">
				<div className="lbl-prop">COMPRESSION</div>
				<div className="lbl-readonly">
					{bucket.compressed ? "YES" : "NO"}
				</div>
			</div>

		</TitleAccordion>

	</div>
}

export default ShowForm
