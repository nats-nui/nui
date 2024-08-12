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
			<HexBlock block={block} />
			<HexAsciiBlock block={block} />
		</div>
	)
}

export default HexRow


const cssRow: React.CSSProperties = {
	display: "flex",
	justifyContent: 'space-between',
}
const cssIndex: React.CSSProperties = {
	minWidth: 30,
	opacity: .7,
}
