import RowButton from "@/components/rows/RowButton"
import FrameworkCard from "@/components/cards/FrameworkCard"
import docSo from "@/stores/docs"
import { BucketStore } from "@/stores/stacks/buckets/detail"
import { DOC_TYPE, EDIT_STATE } from "@/types"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect } from "react"
import ActionsCmp from "./Actions"
import CreateForm from "./CreateForm"
import ShowForm from "./ShowForm"
import MessagesIcon from "@/icons/cards/MessagesIcon"
import BoxV from "@/components/format/BoxV"
import IconRow2 from "@/components/rows/IconRow2"
import KvEntriesIcon from "@/icons/cards/KvEntriesIcon"



interface Props {
	store?: BucketStore
}

const BucketDetailView: FunctionComponent<Props> = ({
	store: bucketSo,
}) => {

	// STORE
	const bucketSa = useStore(bucketSo)
	useStore(docSo)

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
		iconizedRender={
			<BoxV style={{ marginTop: 10 }}>
				<IconRow2
					icon={<KvEntriesIcon />}
					tooltip="KVENTRIES"
					selected={isKVEntriesSelect}
					variant={variant}
					onClick={handleKVEntriesClick}
				/>
			</BoxV>
		}
	>
		{inRead ? (<>
			<RowButton
				icon={<KvEntriesIcon />}
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
