import React, { FunctionComponent } from "react"
import HexRow from "./HexRow"



interface Props {
	text?: string
	maxRows?: number
	columns?: number
}

const HexTable: FunctionComponent<Props> = ({
	text,
	maxRows,
	columns = 8
}) => {
	// STORE

	// HOOKs

	// HANDLER

	// RENDER
	if (!text) return null
	const encoder = new TextEncoder()
	const ascii = encoder.encode(text)
	const render = []
	const maxBlocks = maxRows ? columns * maxRows : Infinity
	for (let i = 0; i < ascii.length && i < maxBlocks; i += columns) {
		const block = ascii.slice(i, i + columns)
		render.push(<HexRow key={i} index={i} block={block} />)
	}
	return (
		<div style={cssBody}>
			{render}
		</div>
	)
}

export default HexTable

const cssBody: React.CSSProperties = {
	fontFamily: "monospace",
	fontSize: 14,
}

