import LinkButton from "@/components/buttons/LinkButton"
import FrameworkCard from "@/components/cards/FrameworkCard"
import RowButton from "@/components/rows/RowButton"
import BucketIcon from "@/icons/cards/BucketIcon"
import KvEntriesIcon from "@/icons/cards/KvEntriesIcon"
import StreamIcon from "@/icons/cards/StreamIcon"
import { BucketStore } from "@/stores/stacks/buckets/detail"
import { EDIT_STATE } from "@/types"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect } from "react"
import { cardCls } from "@/themes"
import ActionsCmp from "./Actions"
import Form from "./Form"



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
	const handleStreamClick = () => bucketSo.openStream()

	// RENDER
	const inRead = bucketSa.editState == EDIT_STATE.READ
	const isKVEntriesSelect = bucketSo.getKVEntriesOpen()

	return <FrameworkCard
		className={cardCls("buckets", true)}
		icon={<BucketIcon />}
		store={bucketSo}
		actionsRender={<ActionsCmp store={bucketSo} />}
		iconizedRender={
			<div className="lyt-v lyt-v-btts">
				<LinkButton
					icon={<KvEntriesIcon />}
					tooltip="KVENTRIES"
					className="jack-focus-1"
					selected={isKVEntriesSelect}
					onClick={handleKVEntriesClick}
				/>
				<LinkButton
					icon={<StreamIcon />}
					tooltip="STREAM"
					className="jack-focus-2"
					onClick={handleStreamClick}
				/>
			</div>
		}
	>
		{inRead && <>
			<RowButton style={{ marginBottom: 13 }}
				icon={<KvEntriesIcon className="small-icon"/>}
				label="KVENTRIES"
				className="jack-focus-1"
				selected={isKVEntriesSelect}
				onClick={handleKVEntriesClick}
			/>
			<RowButton
				icon={<StreamIcon className="small-icon"/>}
				label="STREAM"
				className="jack-focus-2"
				onClick={handleStreamClick}
			/>
		</>}

		<Form store={bucketSo} />

	</FrameworkCard>
}

export default BucketDetailView
