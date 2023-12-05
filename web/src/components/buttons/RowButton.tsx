import React, { FunctionComponent, useState } from "react"
import layoutSo from "@/stores/layout"
import { Color } from "@/types"



interface Props {
	icon?: React.ReactNode
	label?: string
	select?: boolean
	onClick?: (e:React.MouseEvent) => void
	style?: React.CSSProperties
}

const RowButton: FunctionComponent<Props> = ({
	icon,
	label,
	select,
	onClick,
	style,
}) => {

	// STORE
	const [mouseOver, setMouseOver] = useState(false)

	// HOOK

	// HANDLER
	const handleEnter = () => setMouseOver(true)
	const handleLeave = () => setMouseOver(false)

	// RENDER
	const styRoot:React.CSSProperties = {
		...cssRoot,
		...(select && cssRootSelect),
		...style,
		// backgroundColor: mouseOver ? layoutSo.state.theme.palette.bg.acid[colorVar] : null,
		// color: mouseOver ? layoutSo.state.theme.palette.fg.acid[colorVar] : layoutSo.state.theme.palette.fg.default,
	}
	return (
		<div style={styRoot}
			onClick={onClick}
			onMouseEnter={handleEnter}
			onMouseLeave={handleLeave}
		>
			{icon}
			<div style={cssLabel}>{label}</div>
		</div>
	)
}

export default RowButton

const cssRoot:React.CSSProperties = {
	transition: "background-color 400ms, color 400ms",
	display: "flex", alignItems: "center",
	padding: "5px 8px",
	color: layoutSo.state.theme.palette.fg.acid[0],
	cursor: "pointer",
	marginLeft: -7
}
const cssRootSelect:React.CSSProperties = {
	backgroundColor: layoutSo.state.theme.palette.bg.default,
	color: layoutSo.state.theme.palette.fg.default,
}
const cssLabel:React.CSSProperties = {
	...layoutSo.state.theme.texts.rowButton,
	marginLeft: 5,
}
