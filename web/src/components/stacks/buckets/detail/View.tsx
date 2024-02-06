import FrameworkCard from "@/components/FrameworkCard"
import docSo from "@/stores/docs"
import { BucketStore } from "@/stores/stacks/buckets/detail"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect } from "react"
import ActionsCmp from "./Actions"
import EditForm from "./EditForm"
import ShowForm from "./ShowForm"
import RowButton from "@/components/buttons/RowButton"
import MessagesIcon from "@/icons/MessagesIcon"
import { DOC_TYPE } from "@/types"


interface Props {
	store?: BucketStore
}

const BucketDetailView: FunctionComponent<Props> = ({
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
	const handleKVEntriesClick = () => bucketSo.openKVEntries()

	// RENDER
	const readOnly = streamSa.readOnly
	const variant = streamSa.colorVar
	const isKVEntriesSelect = streamSa.linked?.state.type == DOC_TYPE.KVENTRIES

	return <FrameworkCard
		variantBg={variant}
		store={bucketSo}
		actionsRender={<ActionsCmp store={bucketSo} />}
	>
		{readOnly ? (<>
			<RowButton
				icon={<MessagesIcon />}
				label="KVENTRIES"
				variant={variant}
				selected={isKVEntriesSelect}
				onClick={handleKVEntriesClick}
			/>
			<ShowForm store={bucketSo} />
		</>) : (
			<EditForm store={bucketSo} />
		)}
	</FrameworkCard>
}

export default BucketDetailView
