import layoutSo from "@/stores/layout"
import React, { FunctionComponent } from "react"
import HexAsciiBlock from "./HexAsciiBlock"
import HexBlock from "./HexBlock"



interface Props {
	block: Uint8Array,
	index: number,
}

const HexRow: FunctionComponent<Props> = ({
	block,
	index,
}) => {
	// STORE

	// HOOKs

	// HANDLER

	// RENDER
	return (
		<div style={cssRow}>
			<div style={cssIndex}>{index}</div>
			<div style={{ flex: 1 }}><HexBlock block={block} /></div>
			<div><HexAsciiBlock block={block} /></div>
		</div>
	)
}

export default HexRow


const cssRow: React.CSSProperties = {
	display: "flex",
}
const cssIndex: React.CSSProperties = {
	minWidth: 30,
	color: layoutSo.state.theme.palette.default.fg2,
}
