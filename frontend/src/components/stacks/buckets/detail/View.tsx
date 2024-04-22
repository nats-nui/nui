import LinkButton from "@/components/buttons/LinkButton"
import FrameworkCard from "@/components/cards/FrameworkCard"
import RowButton from "@/components/rows/RowButton"
import KvEntriesIcon from "@/icons/cards/KvEntriesIcon"
import { BucketStore } from "@/stores/stacks/buckets/detail"
import { EDIT_STATE } from "@/types"
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
	useStore(bucketSo.state.group)

	// HOOKs
	useEffect(() => {
		bucketSo.fetchIfVoid()
	}, [])

	// HANDLER
	const handleKVEntriesClick = () => bucketSo.openKVEntries()

	// RENDER
	const inRead = bucketSa.editState == EDIT_STATE.READ
	const isKVEntriesSelect = bucketSo.getKVEntriesOpen()

	return <FrameworkCard variantBg
		store={bucketSo}
		actionsRender={<ActionsCmp store={bucketSo} />}
		iconizedRender={
			<div className="lyt-v lyt-v-btts">
				<LinkButton
					icon={<KvEntriesIcon />}
					tooltip="KVENTRIES"
					selected={isKVEntriesSelect}
					onClick={handleKVEntriesClick}
				/>
			</div>
		}
	>
		{inRead ? (<>
			<RowButton style={{ marginBottom: 13 }}
				icon={<KvEntriesIcon />}
				label="KVENTRIES"
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
