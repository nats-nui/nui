import FrameworkCard from "@/components/FrameworkCard"
import RowButton from "@/components/buttons/RowButton"
import MessagesIcon from "@/icons/MessagesIcon"
import { BucketStore } from "@/stores/stacks/buckets/detail"
import { DOC_TYPE, EDIT_STATE } from "@/types"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect } from "react"
import ActionsCmp from "./Actions"
import CreateForm from "./CreateForm"
import ShowForm from "./ShowForm"


interface Props {
	store?: BucketStore
}

const BucketDetailView: FunctionComponent<Props> = ({
	store: bucketSo,
}) => {

	// STORE
	const bucketSa = useStore(bucketSo)

	// HOOKs
	useEffect(() => {
		bucketSo.fetch()
	}, [])

	// HANDLER
	const handleKVEntriesClick = () => bucketSo.openKVEntries()

	// RENDER
	const inRead = bucketSa.editState == EDIT_STATE.READ
	const isKVEntriesSelect = bucketSa.linked?.state.type == DOC_TYPE.KVENTRIES
	const variant = bucketSa.colorVar

	return <FrameworkCard
		variantBg={variant}
		store={bucketSo}
		actionsRender={<ActionsCmp store={bucketSo} />}
	>
		{inRead ? (<>
			<RowButton
				icon={<MessagesIcon />}
				label="KVENTRIES"
				variant={variant}
				selected={isKVEntriesSelect}
				onClick={handleKVEntriesClick}
			/>
			<ShowForm store={bucketSo} />
		</>) : (
			<CreateForm store={bucketSo} />
		)}
	</FrameworkCard>
}

export default BucketDetailView
