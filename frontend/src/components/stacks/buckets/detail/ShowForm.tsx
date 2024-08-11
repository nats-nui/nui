import { BucketStore } from "@/stores/stacks/buckets/detail"
import { TitleAccordion } from "@priolo/jack"
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

	return <div className="jack-lyt-form">

		<TitleAccordion title="BASE">

			<div className="lyt-h-props">
				<div className="item">
					<div className="jack-lbl-prop">VALUES</div>
					<div className="jack-lbl-readonly">
						{bucket.values}
					</div>
				</div>
				<div className="lbl-divider-v" />
				<div className="item">
					<div className="jack-lbl-prop">BYTES</div>
					<div className="jack-lbl-readonly">
						{bucket.bytes}
					</div>
				</div>
			</div>

			<div className="lyt-v">
				<div className="jack-lbl-prop">NAME</div>
				<div className="jack-lbl-readonly">
					{bucket.bucket}
				</div>
			</div>



		</TitleAccordion>


		<TitleAccordion title="CONFIG">

			<div className="lyt-h-props">
				<div className="item">
					<div className="jack-lbl-prop">HISTORY</div>
					<div className="jack-lbl-readonly">
						{bucket.history}
					</div>
				</div>
				<div className="lbl-divider-v" />
				<div className="item">
					<div className="jack-lbl-prop">TTL</div>
					<div className="jack-lbl-readonly">
						{bucket.ttl}
					</div>
				</div>
			</div>

			<div className="lyt-v">
				<div className="jack-lbl-prop">BACKING STORE</div>
				<div className="jack-lbl-readonly">
					{bucket.backingStore}
				</div>
			</div>

			<div className="lyt-v">
				<div className="jack-lbl-prop">COMPRESSION</div>
				<div className="jack-lbl-readonly">
					{bucket.compressed ? "YES" : "NO"}
				</div>
			</div>

		</TitleAccordion>

	</div>
}

export default ShowForm
