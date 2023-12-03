import React, { FunctionComponent, useState } from "react"
import layoutSo from "@/stores/layout"
import { Color } from "@/types"



interface Props {
	label?: string
	colorVar?: number
	onClick?: (e:React.MouseEvent) => void
}

const Button: FunctionComponent<Props> = ({
	label,
	colorVar = 0,
	onClick,
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
		backgroundColor: mouseOver ? layoutSo.state.theme.palette.bg.acid[colorVar] : null,
		color: mouseOver ? layoutSo.state.theme.palette.fg.acid[colorVar] : layoutSo.state.theme.palette.fg.default,
	}
	return (
		<div style={styRoot}
			onClick={onClick}
			onMouseEnter={handleEnter}
			onMouseLeave={handleLeave}
		>
			<div style={cssLabel}>{label}</div>
		</div>
	)
}

export default Button

const cssRoot:React.CSSProperties = {
	transition: "background-color 400ms, color 400ms",
	color: layoutSo.state.theme.palette.fg.acid[0],
	cursor: "pointer",
	borderRadius: 10,
	padding: '3px 6px',

}

const cssLabel:React.CSSProperties = {
	...layoutSo.state.theme.texts.button,
}
