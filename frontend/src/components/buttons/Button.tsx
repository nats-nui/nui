import layoutSo from "@/stores/layout"
import { ANIM_TIME_CSS } from "@/types"
import React, { FunctionComponent, useState } from "react"



interface Props {
	select?: boolean
	children?: React.ReactNode

	variant?: number
	disabled?: boolean
	onClick?: (e: React.MouseEvent<HTMLDivElement>, select: boolean) => void
}

const Button: FunctionComponent<Props> = ({
	select,
	children,

	variant = 0,
	disabled,
	onClick,
}) => {

	// STORE
	const [mouseOver, setMouseOver] = useState(false)

	// HOOK

	// HANDLER
	const handleEnter = () => setMouseOver(true)
	const handleLeave = () => setMouseOver(false)
	const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
		onClick?.(e, select)
	}

	// RENDER
	const styRoot: React.CSSProperties = {
		...cssRoot,
		...(mouseOver || select ? {color: "#393939"} : {}),
		...(disabled ? cssDisabled : {}),
	}
	return (
		<div style={styRoot} className={(mouseOver || select) ? "color-bg" : null}
			onClick={handleClick}
			onMouseEnter={handleEnter}
			onMouseLeave={handleLeave}
		>
			{children}
		</div>
	)
}

export default Button

const cssRoot: React.CSSProperties = {
	transition: `background-color ${ANIM_TIME_CSS}ms, color ${ANIM_TIME_CSS}ms`,
	cursor: "pointer",
	borderRadius: 5,
	padding: '5px 6px',
	fontSize: 10, 
	fontWeight: 800,
}
const cssDisabled: React.CSSProperties = {
	opacity: 0.5,
	pointerEvents: "none",
}

