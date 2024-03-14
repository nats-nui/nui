import Button from "@/components/buttons/Button"
import FrameworkCard from "@/components/cards/FrameworkCard"
import AlertDialog from "@/components/dialogs/AlertDialog"
import FindInput from "@/components/input/FindInput"
import OptionsCmp from "@/components/options/OptionsCmp"
import Table from "@/components/table"
import docSo from "@/stores/docs"
import { BucketsStore } from "@/stores/stacks/buckets"
import { BucketStore } from "@/stores/stacks/buckets/detail"
import { DOC_TYPE } from "@/types"
import { BucketState } from "@/types/Bucket"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect } from "react"



interface Props {
	store?: BucketsStore
}

const BucketsListView: FunctionComponent<Props> = ({
	store: bucketsSo,
}) => {

	// STORE
	const bucketsSa = useStore(bucketsSo)
	const docSa = useStore(docSo)

	// HOOKs
	useEffect(() => {
		bucketsSo.fetch()
	}, [])

	// HANDLER
	const handleSelect = (bucket: BucketState) => bucketsSo.select(bucket.bucket)
	const handleNew = () => bucketsSo.create()
	const handleDelete = () => bucketsSo.delete()

	// RENDER
	const buckets = bucketsSo.getFiltered() ?? []
	if (!buckets) return null
	const selected = bucketsSa.select
	const variant = bucketsSa.colorVar
	const isNewSelect = bucketsSa.linked?.state.type == DOC_TYPE.BUCKET && !!(bucketsSa.linked as BucketStore).state.bucketConfig

	return <FrameworkCard styleBody={{ padding: 0 }}
		store={bucketsSo}
		actionsRender={<>
			<OptionsCmp
				style={{ marginLeft: 5, backgroundColor: "rgba(255,255,255,.4)" }}
				store={bucketsSo}
			/>
			<FindInput
				value={bucketsSa.textSearch}
				onChange={text => bucketsSo.setTextSearch(text)}
			/>
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
		<Table
			items={buckets}
			props={[
				{ label: "VALUES", getValue: b => b.values },
				{ label: "HISTORY", getValue: b => b.history },
				{ label: "TTL", getValue: b => b.ttl },
				{ label: "BYTES", getValue: b => b.bytes },
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
