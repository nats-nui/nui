import FrameworkCard from "@/components/FrameworkCard"
import Button from "@/components/buttons/Button"
import BoxV from "@/components/format/BoxV"
import IconRow from "@/components/rows/IconRow"
import docSo from "@/stores/docs"
import layoutSo from "@/stores/layout"
import { StreamsStore } from "@/stores/stacks/streams"
import { StreamStore } from "@/stores/stacks/streams/detail"
import { DOC_TYPE, EDIT_STATE } from "@/types"
import { StreamInfo } from "@/types/Stream"
import { useStore } from "@priolo/jon"
import { CSSProperties, FunctionComponent, useEffect } from "react"



interface Props {
	store?: StreamsStore
}

const StreamsListView: FunctionComponent<Props> = ({
	store: streamsSo,
}) => {

	// STORE
	const streamsSa = useStore(streamsSo)
	const docSa = useStore(docSo)

	// HOOKs
	useEffect(() => {
		streamsSo.fetchIfVoid()
	}, [])

	// HANDLER
	const handleSelect = (stream: StreamInfo) => streamsSo.select(stream.config.name)
	const handleNew = () => streamsSo.create()
	const handleDelete = () => streamsSo.delete()

	// const handleMessages = (e: React.MouseEvent, stream: StreamInfo) => {
	// 	e.stopPropagation()
	// 	streamsSo.openMessages(stream.config?.name)
	// }
	// const handleConsumer = (e: React.MouseEvent, stream: StreamInfo) => {
	// 	e.stopPropagation()
	// 	streamsSo.openConsumers(stream.config?.name)
	// }

	// RENDER
	const streams = streamsSa.all
	if (!streams) return null
	const selected = streamsSa.select
	const variant = streamsSa.colorVar
	const isSelected = (stream: StreamInfo) => selected == stream.config.name
	const getTitle = (stream: StreamInfo) => stream.config.name
	const getSubtitle = (stream: StreamInfo) => stream.config.description
	const isNewSelect = streamsSa.linked?.state.type == DOC_TYPE.STREAM && (streamsSa.linked as StreamStore).state.editState == EDIT_STATE.NEW

	return <FrameworkCard styleBody={{ paddingTop: 0 }}
		store={streamsSo}
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
		iconizedRender={<BoxV>{
			streams.map(stream => (
				<IconRow key={stream.config.name}
					title={getTitle(stream)}
					subtitle={getSubtitle(stream)}
					selected={isSelected(stream)}
					variant={variant}
					onClick={() => handleSelect(stream)}
				/>
			))
		}</BoxV>}
	>

		<div style={{ marginLeft: -9, marginRight: -9 }}>
			<table style={cssTable}>
				<thead >
					<tr style={cssHead}>
						{/* <th style={{ ...cssHeadCell, width: "100%" }}>
							NAME
						</th> */}
						<th style={cssHeadCell}>
							SIZE
						</th>
						<th style={cssHeadCell}>
							FIRST
						</th>
						<th style={cssHeadCell}>
							LAST
						</th>
						<th style={cssHeadCell}>
							BYTEs
						</th>

					</tr>
				</thead>
				<tbody>
					{streams.map((stream, index) => (<>
						<tr key={`${stream.config.name}_1`} style={{ height: 25}}>
							<td colSpan={4} style={{ fontSize: 12, fontWeight: 400, opacity: 0.9 }}>
								{stream.config.name}
							</td>
						</tr>
						<tr key={stream.config.name}
							style={cssRow(index, isSelected(stream), variant)}
							onClick={() => handleSelect(stream)}
						>
							{/* <td style={{ ...cssRowCellString, width: "100%" }}>
								{stream.config.name}
							</td> */}
							<td style={cssRowCellNumber}>
								{stream.state.messages}
							</td>
							<td style={cssRowCellNumber}>
								{stream.state.firstSeq}
							</td>
							<td style={cssRowCellNumber}>
								{stream.state.lastSeq}
							</td>
							<td style={cssRowCellNumber}>
								{stream.state.bytes}
							</td>
						</tr>
					</>))}
				</tbody>
			</table>
		</div>

	</FrameworkCard>
}

export default StreamsListView



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
	zIndex: 1,
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
		backgroundColor:  "rgba(0, 0, 0, 0.3)",
		//backgroundColor: index % 2 == 0 ? "rgba(0, 0, 0, 0.3)" : null,
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
	fontSize: 12,
	fontWeight: 600,
	textAlign: "right",
}
const cssRowCellString: CSSProperties = {
	...cssRowCell,
	overflow: "hidden",
	whiteSpace: "nowrap",
	textOverflow: "ellipsis",
	maxWidth: 0,
}