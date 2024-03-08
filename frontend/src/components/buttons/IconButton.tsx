import { ANIM_TIME_CSS } from "@/types"
import React, { FunctionComponent, useState } from "react"
import layoutSo from "@/stores/layout"



interface Props {
	onClick?: (e: React.MouseEvent) => void
	children?: React.ReactNode
	variant?: number
	style?: React.CSSProperties
}

const IconButton: FunctionComponent<Props> = ({
	onClick,
	children,
	variant,
	style,
}) => {
	// STORE

	// HOOK
	const [mouseOver, setMouseOver] = useState(false)

	// HANDLER

	// RENDER

	return (
		<div style={{ ...cssContainer(mouseOver, variant), ...style }}
			onClick={onClick}
			onMouseEnter={variant ? () => setMouseOver(true) : null}
			onMouseLeave={variant ? () => setMouseOver(false) : null}
		>
			{children}
		</div>
	)
}

export default IconButton

const cssContainer = (mouseOver: boolean, variant: number): React.CSSProperties => ({
	display: "flex",
	cursor: "pointer",
	padding: 2,
	
	transition: `background-color ${ANIM_TIME_CSS}ms, color ${ANIM_TIME_CSS}ms`,
	backgroundColor: mouseOver ? layoutSo.state.theme.palette.var[variant].bg : null,
	color: mouseOver ? layoutSo.state.theme.palette.var[variant].fg : null,
	borderRadius: 3,
})