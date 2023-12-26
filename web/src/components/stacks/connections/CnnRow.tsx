import { Connection } from "@/types"
import React, { FunctionComponent } from "react"
import layoutSo from "@/stores/layout"


interface Props {
	cnn: Connection
	selected?: boolean
	variant?: number
	onClick?: (cnn: Connection) => void
}

/**
 * Lo STACK di una collezione di CONNECTIONs
 */
const CnnRow: FunctionComponent<Props> = ({
	cnn,
	selected,
	variant = 0,
	onClick,
}) => {

	// STORE

	// HOOKs

	// HANDLER
	const handleSelectConnection = () => onClick?.(cnn)

	// RENDER
	if (!cnn) return null

	return <div style={cssRow(selected, variant)}
		onClick={handleSelectConnection}
	>
		<div style={layoutSo.state.theme.texts.row.title}>{cnn.name}</div>
		<div style={layoutSo.state.theme.texts.row.subtitle}>sottotitolo</div>
	</div>
}

export default CnnRow

const cssRow = (select: boolean, variant:number): React.CSSProperties => ({
	display: "flex", flexDirection: "column",
	cursor: "pointer",
	backgroundColor: select ? layoutSo.state.theme.palette.var[variant].bg : "unset",
	color: select ? layoutSo.state.theme.palette.var[variant].fg : "unset",
	margin: "3px 0px 3px 6px",
	borderRadius: "20px 0px 0px 20px",
	padding: "4px 15px",
})
