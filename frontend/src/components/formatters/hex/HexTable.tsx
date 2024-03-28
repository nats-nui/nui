import React, { FunctionComponent, useMemo } from "react"
import HexRow from "./HexRow"
import cls from "./HexTable.module.css"



interface Props {
	text?: string
	maxRows?: number
	columns?: number
	style?: React.CSSProperties
}

const HexTable: FunctionComponent<Props> = ({
	text,
	maxRows,
	columns = 8,
	style,
}) => {
	// STORE

	// HOOKs

	// HANDLER

	// RENDER
	if (!text) return null

	const render = useMemo(() => {
		const encoder = new TextEncoder()
		const ascii = encoder.encode(text)
		const render = []
		const maxBlocks = maxRows ? columns * maxRows : Infinity
		for (let i = 0; i < ascii.length && i < maxBlocks; i += columns) {
			const block = ascii.slice(i, i + columns)
			render.push(<HexRow key={i} index={i} block={block} />)
		}
		return render
	}, [text])

	return (
		<div className={cls.root} style={style}>
			{render}
		</div>
	)
}

export default HexTable

