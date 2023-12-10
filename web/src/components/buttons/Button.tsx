import layoutSo from "@/stores/layout"
import { ANIM_TIME_CSS } from "@/types"
import React, { FunctionComponent, useState } from "react"



interface Props {
	select?: boolean
	label?: string
	colorVar?: number
	onClick?: (e: React.MouseEvent<HTMLDivElement>, select:boolean) => void
}

const Button: FunctionComponent<Props> = ({
	select,
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
	const handleClick = (e:React.MouseEvent<HTMLDivElement>) => {
		onClick?.(e, select)
	}

	// RENDER
	const styRoot: React.CSSProperties = {
		...cssRoot,
		...(mouseOver || select ? cssSelect(colorVar) : {}),
	}
	return (
		<div style={styRoot}
			onClick={handleClick}
			onMouseEnter={handleEnter}
			onMouseLeave={handleLeave}
		>
			<div style={cssLabel}>{label}</div>
		</div>
	)
}

export default Button

const cssRoot: React.CSSProperties = {
	transition: `background-color ${ANIM_TIME_CSS}ms, color ${ANIM_TIME_CSS}ms`,
	cursor: "pointer",
	borderRadius: 10,
	padding: '3px 6px',
}
const cssSelect = ( colorVar:number ) => ({
	backgroundColor: layoutSo.state.theme.palette.bg.acid[colorVar] ,
	color: layoutSo.state.theme.palette.fg.acid[colorVar],
})

const cssLabel: React.CSSProperties = {
	...layoutSo.state.theme.texts.button,
}
