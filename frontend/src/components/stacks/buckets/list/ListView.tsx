import FrameworkCard from "@/components/cards/FrameworkCard"
import Button from "@/components/buttons/Button"
import Table from "@/components/table"
import docSo from "@/stores/docs"
import { BucketsStore } from "@/stores/stacks/buckets"
import { BucketStore } from "@/stores/stacks/buckets/detail"
import { DOC_TYPE } from "@/types"
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
	const handleSelect = (index: number) => bucketsSo.select(buckets[index].bucket)
	const handleNew = () => bucketsSo.create()
	const handleDelete = () => bucketsSo.delete()

	// RENDER
	const buckets = bucketsSa.all
	if (!buckets) return null
	const selected = bucketsSa.select
	const selectedIndex = bucketsSo.getIndexByName(bucketsSa.select)
	const variant = bucketsSa.colorVar
	const isNewSelect = bucketsSa.linked?.state.type == DOC_TYPE.BUCKET && !!(bucketsSa.linked as BucketStore).state.bucketConfig

	return <FrameworkCard styleBody={{ paddingTop: 0 }}
		store={bucketsSo}
		actionsRender={<>
			{!!selected && <Button
				label="DELETE"
				variant={variant}
				onClick={handleDelete}
			/>}
			<Button
				label="NEW"
				select={isNewSelect}
				variant={variant}
				onClick={handleNew}
			/>
		</>}
	>

		<div style={{ marginLeft: -9, marginRight: -9 }}>

			<Table
				items={buckets}
				props={[
					{ label: "VALUES", getValue: b => b.values },
					{ label: "HISTORY", getValue: b => b.history },
					{ label: "TTL", getValue: b => b.ttl },
					{ label: "BYTES", getValue: b => b.bytes },
				]}
				propMain={{ getValue: b => b.bucket }}
				select={selectedIndex}
				onSelectChange={handleSelect}
				variant={variant}
			/>

		</div>

	</FrameworkCard>
}

export default BucketsListView
