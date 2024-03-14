import { ANIM_TIME_CSS } from "@/types"
import React, { FunctionComponent, useState } from "react"



interface Props {
	onClick?: (e: React.MouseEvent) => void
	children?: React.ReactNode
	effect?: boolean
	style?: React.CSSProperties
}

const IconButton: FunctionComponent<Props> = ({
	onClick,
	children,
	effect,
	style,
}) => {
	// STORE

	// HOOK
	const [mouseOver, setMouseOver] = useState(false)

	// HANDLER

	// RENDER

	return (
		<div style={{ ...cssContainer(mouseOver), ...style }} className={mouseOver? "color-bg color-text" : null}
			onClick={onClick}
			onMouseEnter={effect ? () => setMouseOver(true) : null}
			onMouseLeave={effect ? () => setMouseOver(false) : null}
		>
			{children}
		</div>
	)
}

export default IconButton

const cssContainer = (mouseOver: boolean): React.CSSProperties => ({
	display: "flex",
	cursor: "pointer",
	padding: 2,
	
	transition: `background-color ${ANIM_TIME_CSS}ms, color ${ANIM_TIME_CSS}ms`,
	borderRadius: 3,
})