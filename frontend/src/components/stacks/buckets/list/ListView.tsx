import FrameworkCard from "@/components/cards/FrameworkCard"
import { BucketsStore } from "@/stores/stacks/buckets"
import { BucketStore } from "@/stores/stacks/buckets/detail"
import { DOC_TYPE, EDIT_STATE } from "@/types"
import { BucketState } from "@/types/Bucket"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect } from "react"
import BucketsIcon from "../../../../icons/cards/BucketsIcon"
import clsCard from "../../CardMintDef.module.css"
import { AlertDialog, Button, FindInputHeader, OptionsCmp, VTable } from "@priolo/jack"
import { formatNumber } from "../../../../utils/string"



interface Props {
	store?: BucketsStore
}

const BucketsListView: FunctionComponent<Props> = ({
	store: bucketsSo,
}) => {

	// STORE
	const bucketsSa = useStore(bucketsSo)
	useStore(bucketsSo.state.group)

	// HOOKs
	useEffect(() => {
		bucketsSo.fetchIfVoid()
	}, [])

	// HANDLER
	const handleSelect = (bucket: BucketState) => bucketsSo.select(bucket.bucket)
	const handleNew = () => bucketsSo.create()
	const handleDelete = () => bucketsSo.delete()
	const handlePurge = () => bucketsSo.purgeDeleted()

	// RENDER
	const buckets = bucketsSo.getFiltered() ?? []
	if (!buckets) return null
	const selected = bucketsSa.select
	const isNewSelect = bucketsSa.linked?.state.type == DOC_TYPE.BUCKET
		&& (bucketsSa.linked as BucketStore).state.editState == EDIT_STATE.NEW

	return <FrameworkCard styleBody={{ padding: 0 }}
		className={clsCard.root}
		icon={<BucketsIcon />}
		store={bucketsSo}
		actionsRender={<>
			<OptionsCmp
				style={{ marginLeft: 5, backgroundColor: "rgba(255,255,255,.4)" }}
				store={bucketsSo}
			/>
			<FindInputHeader
				value={bucketsSa.textSearch}
				onChange={text => bucketsSo.setTextSearch(text)}
			/>
			{!!selected && <Button
				children="PURGE"
				onClick={handlePurge}
			/>}
			{!!selected && <Button
				children="DELETE"
				onClick={handleDelete}
			/>}
			<Button
				children="NEW"
				select={isNewSelect}
				onClick={handleNew}
			/>
		</>}
	>
		<VTable
			items={buckets}
			props={[
				{ label: "VALUES", getValue: b => b.values, getShow: b => formatNumber(b.values) },
				{ label: "HISTORY", getValue: b => b.history },
				{ label: "TTL", getValue: b => b.ttl },
				{ label: "BYTES", getValue: b => b.bytes, getShow: b => formatNumber(b.bytes) },
			]}
			propMain={{ getValue: b => b.bucket }}
			selectId={selected}
			onSelectChange={handleSelect}
			getId={(bucket: BucketState) => bucket.bucket}
		/>

		<AlertDialog store={bucketsSo} />

	</FrameworkCard>
}

export default BucketsListView
