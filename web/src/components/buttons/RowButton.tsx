import React, { FunctionComponent, useState } from "react"
import layoutSo, { COLOR_VAR } from "@/stores/layout"
import { ANIM_TIME_CSS, Color } from "@/types"



interface Props {
	icon?: React.ReactNode
	label?: string
	select?: boolean
	variant?: number
	onClick?: (e: React.MouseEvent) => void
}

const RowButton: FunctionComponent<Props> = ({
	icon,
	label,
	select,
	variant = 0,
	onClick,
}) => {

	// STORE
	const [mouseOver, setMouseOver] = useState(false)

	// HOOK

	// HANDLER
	const handleEnter = () => setMouseOver(true)
	const handleLeave = () => setMouseOver(false)

	// RENDER
	return (
		<div style={cssRoot(variant, select)}
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

const cssRoot = (variant: number, select: boolean): React.CSSProperties => ({
	transition: `background-color ${ANIM_TIME_CSS}ms, color ${ANIM_TIME_CSS}ms`,
	display: "flex", alignItems: "center",
	padding: "5px 8px",
	color: layoutSo.state.theme.palette.var[select ? COLOR_VAR.DEFAULT : variant].fg,
	backgroundColor: select ? layoutSo.state.theme.palette.default.bg : null,
	cursor: "pointer",
})
const cssLabel: React.CSSProperties = {
	...layoutSo.state.theme.texts.rowButton,
	marginLeft: 5,
}
