import layoutSo, { COLOR_VAR } from "@/stores/layout"
import { ANIM_TIME_CSS } from "@/types"
import React, { FunctionComponent, useState } from "react"



interface Props {
	icon?: React.ReactNode
	label?: string
	selected?: boolean
	renderEnd?: React.ReactElement
	onClick?: (e: React.MouseEvent) => void
	style?: React.CSSProperties
}

const RowButton: FunctionComponent<Props> = ({
	icon,
	label,
	selected,
	renderEnd,
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
	return (
		<div style={{ ...cssRoot(selected), ...style }}
			onClick={onClick}
			onMouseEnter={handleEnter}
			onMouseLeave={handleLeave}
		>
			{icon}
			<div style={cssLabel}>{label}</div>
			{renderEnd}
		</div>
	)
}

export default RowButton

const cssRoot = (select: boolean): React.CSSProperties => ({
	...select && {
		color: layoutSo.state.theme.palette.var[COLOR_VAR.DEFAULT].fg,
		backgroundColor: layoutSo.state.theme.palette.var[COLOR_VAR.DEFAULT].bg,
	},
	transition: `background-color ${ANIM_TIME_CSS}ms, color ${ANIM_TIME_CSS}ms`,
	display: "flex", alignItems: "center",
	padding: "5px 8px",
	cursor: "pointer",
	borderTopLeftRadius: 5,
	borderBottomLeftRadius: 5,
	marginRight: -10,
	marginLeft: -7,
})
const cssLabel: React.CSSProperties = {
	...layoutSo.state.theme.texts.rowButton,
	flex: 1,
	marginLeft: 5,
}
