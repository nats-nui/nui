import FrameworkCard from "@/components/FrameworkCard"
import docSo from "@/stores/docs"
import { BucketStore } from "@/stores/stacks/buckets/detail"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect } from "react"
import ActionsCmp from "./Actions"
import EditForm from "./EditForm"
import ShowForm from "./ShowForm"


interface Props {
	store?: BucketStore
}

const KvEntryDetailView: FunctionComponent<Props> = ({
	store: bucketSo,
}) => {

	// STORE
	const streamSa = useStore(bucketSo)
	const docSa = useStore(docSo)

	// HOOKs
	useEffect(() => {
		bucketSo.fetch()
	}, [])

	// HANDLER

	// RENDER
	const readOnly = streamSa.readOnly
	const variant = streamSa.colorVar

	return <FrameworkCard
		variantBg={variant}
		store={bucketSo}
		actionsRender={<ActionsCmp store={bucketSo} />}
	>
		{readOnly ? (<>
			<ShowForm store={bucketSo} />
		</>) : (
			<EditForm store={bucketSo} />
		)}
	</FrameworkCard>
}

export default KvEntryDetailView
