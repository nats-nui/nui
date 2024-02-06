import FrameworkCard from "@/components/FrameworkCard"
import Button from "@/components/buttons/Button"
import BoxV from "@/components/format/BoxV"
import IconRow from "@/components/rows/IconRow"
import layoutSo from "@/stores/layout"
import { BucketsStore } from "@/stores/stacks/buckets"
import { BucketState } from "@/types/Bucket"
import { useStore } from "@priolo/jon"
import { CSSProperties, FunctionComponent, useEffect } from "react"



interface Props {
	store?: BucketsStore
}

const KVEntryListView: FunctionComponent<Props> = ({
	store: bucketsSo,
}) => {

	// STORE
	const bucketsSa = useStore(bucketsSo)

	// HOOKs
	useEffect(() => {
		bucketsSo.fetch()
	}, [])

	// HANDLER
	const handleSelect = (bucket: BucketState) => bucketsSo.select(bucket.bucket)
	const handleNew = () => bucketsSo.create()

	// RENDER
	const buckets = bucketsSa.all
	if (!buckets) return null
	const selected = bucketsSa.select
	const variant = bucketsSa.colorVar
	const isSelected = (bucket: BucketState) => selected == bucket.bucket
	const getTitle = (bucket: BucketState) => bucket.bucket
	const getSubtitle = (bucket: BucketState) => bucket.bucket

	return <FrameworkCard styleBody={{ paddingTop: 0 }}
		store={bucketsSo}
		actionsRender={<>
			<Button
				label="NEW"
				//select={bttNewSelect}
				variant={variant}
				onClick={handleNew}
			/>
		</>}
		iconizedRender={<BoxV>{
			buckets.map(bucket => (
				<IconRow key={bucket.bucket}
					title={getTitle(bucket)}
					subtitle={getSubtitle(bucket)}
					selected={isSelected(bucket)}
					variant={variant}
					onClick={() => handleSelect(bucket)}
				/>
			))
		}</BoxV>}
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
						<tr style={cssRow(index, isSelected(bucket), variant)}
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

export default KVEntryListView



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