import FrameworkCard from "@/components/FrameworkCard"
import Button from "@/components/buttons/Button"
import docSo from "@/stores/docs"
import layoutSo from "@/stores/layout"
import { BucketsStore } from "@/stores/stacks/buckets"
import { BucketStore } from "@/stores/stacks/buckets/detail"
import { DOC_TYPE } from "@/types"
import { BucketState } from "@/types/Bucket"
import { useStore } from "@priolo/jon"
import { CSSProperties, FunctionComponent, useEffect } from "react"



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
	const buckets = bucketsSa.all
	if (!buckets) return null
	const selected = bucketsSa.select
	const variant = bucketsSa.colorVar
	const isSelected = (bucket: BucketState) => selected == bucket.bucket
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
			<table style={cssTable}>
				<thead >
					<tr style={cssHead}>
						<th style={{ ...cssHeadCell, width: "100%" }}>
							NAME
						</th>
					</tr>
				</thead>
				<tbody>
					{buckets.map((bucket, index) => (
						<tr key={bucket.bucket}
							style={cssRow(index, isSelected(bucket), variant)}
							onClick={() => handleSelect(bucket)}
						>
							<td style={{ ...cssRowCellString, width: "100%" }}>
								{bucket.bucket}
							</td>
							{/* <td style={cssRowCellNumber}>
								{bucket.state.bytes}
							</td> */}
						</tr>
					))}
				</tbody>
			</table>
		</div>

	</FrameworkCard>
}

export default BucketsListView



const cssTable: CSSProperties = {
	width: "100%",
	borderCollapse: "collapse",
	borderSpacing: 0,
}
const cssHead: CSSProperties = {
	fontSize: 13,
	fontWeight: 600,
	height: 28,
	position: 'sticky', 
	top: '0', 
	backgroundColor: '#3e3e3e',
}
const cssHeadCell: CSSProperties = {
	padding: "5px"
}
const cssRow = (index: number, select: boolean, variant: number): CSSProperties => ({
	cursor: "pointer",
	...select ? {
		backgroundColor: layoutSo.state.theme.palette.var[variant].bg,
		color: layoutSo.state.theme.palette.var[variant].fg
	} : {
		backgroundColor: index % 2 == 0 ? "rgba(0, 0, 0, 0.3)" : null,
	},
	height: 20,

})
const cssRowCell: CSSProperties = {
	fontSize: 12,
	fontWeight: 600,

	borderRight: '1px solid rgb(255 255 255 / 15%)',
	padding: "7px 3px",
}
const cssRowCellNumber: CSSProperties = {
	...cssRowCell,
	fontFamily: "monospace",
	fontSize: 11,
	fontWeight: 400,
	textAlign: "right",
}
const cssRowCellString: CSSProperties = {
	...cssRowCell,
	overflow: "hidden",
	whiteSpace: "nowrap",
	textOverflow: "ellipsis",
	maxWidth: 0,
}