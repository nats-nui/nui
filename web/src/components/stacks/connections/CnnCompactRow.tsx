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
const CnnCompactRow: FunctionComponent<Props> = ({
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
	const label = cnn.name.slice(0,2).toUpperCase()

	return <div style={cssRow(selected, variant)}
		onClick={handleSelectConnection}
	>
		<div style={layoutSo.state.theme.texts.row.title}>{label}</div>
	</div>
}

export default CnnCompactRow

const cssRow = (select: boolean, variant:number): React.CSSProperties => ({
	display: "flex", alignItems: 'center',justifyContent: 'center',
	cursor: "pointer",
	backgroundColor: select ? layoutSo.state.theme.palette.var[variant].bg : "unset",
	color: select ? layoutSo.state.theme.palette.var[variant].fg : "unset",
	borderRadius: "50%",
	width: 30, height: 30,
})
