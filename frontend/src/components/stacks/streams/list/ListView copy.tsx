import FrameworkCard from "@/components/cards/FrameworkCard"
import Button from "@/components/buttons/Button"
import BoxV from "@/components/format/BoxV"
import ElementRow from "@/components/rows/ElementRow"
import IconRow from "@/components/rows/IconRow"
import { StreamsStore } from "@/stores/stacks/streams"
import { StreamInfo } from "@/types/Stream"
import { useStore } from "@priolo/jon"
import { CSSProperties, FunctionComponent, useEffect } from "react"
import layoutSo from "@/stores/layout"



interface Props {
	store?: StreamsStore
}

const StreamsListView: FunctionComponent<Props> = ({
	store: streamsSo,
}) => {

	// STORE
	const streamsSa = useStore(streamsSo)

	// HOOKs
	useEffect(() => {
		streamsSo.fetch()
	}, [])

	// HANDLER
	const handleSelect = (stream: StreamInfo) => streamsSo.select(stream.config.name)
	const handleNew = () => streamsSo.create()
	const handleDel = () => {
		streamsSo.delete(selected)
		streamsSo.select(null)
	}
	const handleMessages = (e: React.MouseEvent, stream: StreamInfo) => {
		e.stopPropagation()
		streamsSo.openMessages(stream.config?.name)
	}
	const handleConsumer = (e: React.MouseEvent, stream: StreamInfo) => {
		e.stopPropagation()
		streamsSo.openConsumers(stream.config?.name)
	}

	// RENDER
	const streams = streamsSa.all
	if (!streams) return null
	const selected = streamsSa.select
	const variant = streamsSa.colorVar
	const isSelected = (stream: StreamInfo) => selected == stream.config.name
	const getTitle = (stream: StreamInfo) => stream.config.name
	const getSubtitle = (stream: StreamInfo) => stream.config.description

	return <FrameworkCard
		store={streamsSo}
		actionsRender={<>
			<Button
				children="NEW"
				//select={bttNewSelect}
				variant={variant}
				onClick={handleNew}
			/>
			<Button
				children="DELETE"
				variant={variant}
				onClick={handleDel}
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













		<div style={cssHead}>
			<div style={{ ...cssHeadCell, flex: 3 }}>
				NAME
			</div>
			<div style={cssHeadCell}>
				SIZE
			</div>
			<div style={cssHeadCell}>
				FIRST
			</div>
			<div style={cssHeadCell}>
				LAST
			</div>
			<div style={cssHeadCell}>
				BYTEs
			</div>

		</div>
		<BoxV>
			{streams.map((stream, index) => (
				// <ElementRow key={stream.config.name}
				// 	title={getTitle(stream)}
				// 	subtitle={getSubtitle(stream)}
				// 	selected={isSelected(stream)}
				// 	variant={variant}
				// 	onClick={() => handleSelect(stream)}
				// 	testRender={<>
				// 		<Button label="Messages" onClick={(e) => handleMessages(e, stream)} />
				// 		<Button label="Consumer" onClick={(e) => handleConsumer(e, stream)} />
				// 	</>}
				// />
				<div style={cssRow(index, isSelected(stream), variant)}
					onClick={() => handleSelect(stream)}
				>
					<div style={{ ...cssRowCell, flex: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>
						{stream.config.name}
					</div>
					<div style={cssRowCell}>
						{stream.state.messages}
					</div>
					<div style={cssRowCell}>
						{stream.state.firstSeq}
					</div>
					<div style={cssRowCell}>
						{stream.state.lastSeq}
					</div>
					<div style={cssRowCell}>
						{stream.state.bytes}
					</div>
				</div>
			))}
		</BoxV>
	</FrameworkCard>
}

export default StreamsListView

const cssHead: CSSProperties = {
	fontSize: 13,
	fontWeight: 600,
	display: "flex",
	marginBottom: 5
}
const cssHeadCell: CSSProperties = {
	display: "flex",
	flex: 1,
}
const cssRow = (index: number, select: boolean, variant: number): CSSProperties => ({
	cursor: "pointer",
	display: "flex",
	...select ? {
		backgroundColor: layoutSo.state.theme.palette.var[variant].bg,
		color: layoutSo.state.theme.palette.var[variant].fg
	} : {
		backgroundColor: index % 2 == 0 ? "rgba(0, 0, 0, 0.3)" : null,
	},
	padding: '4px 6px',

})
const cssRowCell: CSSProperties = {
	fontSize: 12,
	fontWeight: 600,
	display: "flex",
	flex: 1,
}