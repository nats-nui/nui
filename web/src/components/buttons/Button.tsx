import layoutSo from "@/stores/layout"
import { ANIM_TIME_CSS } from "@/types"
import React, { FunctionComponent, useState } from "react"



interface Props {
	select?: boolean
	label?: string
	variant?: number
	disabled?: boolean
	onClick?: (e: React.MouseEvent<HTMLDivElement>, select: boolean) => void
}

const Button: FunctionComponent<Props> = ({
	select,
	label,
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
		...(mouseOver || select ? cssSelect(variant) : {}),
		...(disabled ? cssDisabled : {}),
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
const cssDisabled: React.CSSProperties = {
	opacity: 0.5,
	pointerEvents: "none",
}
const cssSelect = (variant: number): React.CSSProperties => ({
	backgroundColor: layoutSo.state.theme.palette.var[variant].bg,
	color: layoutSo.state.theme.palette.var[variant].fg,
})

const cssLabel: React.CSSProperties = {
	...layoutSo.state.theme.texts.button,
}
