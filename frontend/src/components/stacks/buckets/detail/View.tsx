import LinkButton from "@/components/buttons/LinkButton"
import FrameworkCard from "@/components/cards/FrameworkCard"
import RowButton from "@/components/rows/RowButton"
import BucketIcon from "@/icons/cards/BucketIcon"
import KvEntriesIcon from "@/icons/cards/KvEntriesIcon"
import { BucketStore } from "@/stores/stacks/buckets/detail"
import { EDIT_STATE } from "@/types"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect } from "react"
import clsCardRedeye from "../../CardMint.module.css"
import clsCardBoring from "../../CardBoringDef.module.css"
import layoutSo from "@/stores/layout"
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
	useStore(layoutSo)

	// HOOKs
	useEffect(() => {
		bucketSo.fetchIfVoid()
	}, [])

	// HANDLER
	const handleKVEntriesClick = () => bucketSo.openKVEntries()

	// RENDER
	const inRead = bucketSa.editState == EDIT_STATE.READ
	const isKVEntriesSelect = bucketSo.getKVEntriesOpen()
	const clsCard = layoutSo.state.theme == "redeye" ? clsCardRedeye : clsCardBoring

	return <FrameworkCard
		className={clsCard.root}
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
		</>}

		<Form store={bucketSo} />

	</FrameworkCard>
}

export default BucketDetailView
