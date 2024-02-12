import FrameworkCard from "@/components/FrameworkCard"
import Button from "@/components/buttons/Button"
import docSo from "@/stores/docs"
import layoutSo from "@/stores/layout"
import { KVEntriesStore } from "@/stores/stacks/kventry"
import { KVEntryStore } from "@/stores/stacks/kventry/detail"
import { DOC_TYPE, EDIT_STATE } from "@/types"
import { KVEntry } from "@/types/KVEntry"
import { useStore } from "@priolo/jon"
import { CSSProperties, FunctionComponent, useEffect } from "react"


interface Props {
	store?: KVEntriesStore
}

const KVEntryListView: FunctionComponent<Props> = ({
	store: kventriesSo,
}) => {

	// STORE
	const kventriesSa = useStore(kventriesSo)
	const docSa = useStore(docSo)

	// HOOKs
	useEffect(() => {
		kventriesSo.fetchIfVoid()
	}, [])

	// HANDLER
	const handleSelect = (kventry: KVEntry) => kventriesSo.select(kventry.key)
	const handleNew = () => kventriesSo.create()
	const handleDelete = () => kventriesSo.delete()

	// RENDER
	const kventries = kventriesSa.all
	if (!kventries) return null
	const selected = kventriesSa.select
	const variant = kventriesSa.colorVar
	const isSelected = (kventry: KVEntry) => selected == kventry.key
	const isNewSelect = kventriesSa.linked?.state.type == DOC_TYPE.KVENTRY && (kventriesSa.linked as KVEntryStore).state.editState == EDIT_STATE.NEW

	return <FrameworkCard styleBody={{ paddingTop: 0 }}
		store={kventriesSo}
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
						<th style={{ ...cssHeadCell, width: "100%" }}>NAME</th>
					</tr>
				</thead>
				<tbody>
					{kventries.map((kventry, index) => (
						<tr key={kventry.key}
							style={cssRow(index, isSelected(kventry), variant)}
							onClick={() => handleSelect(kventry)}
						>
							<td style={{ ...cssRowCellString, width: "100%" }}>
								{kventry.key}
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