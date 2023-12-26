import React, { FunctionComponent } from "react"
import layoutSo, { COLOR_VAR } from "@/stores/layout"


interface Props {
	onClick?: (e: React.MouseEvent) => void
	children?: React.ReactNode
	variant?: number
}

const FloatButton: FunctionComponent<Props> = ({
	onClick,
	children,
	variant = COLOR_VAR.CYAN,
}) => {
	// STORE

	// HOOK

	// HANDLER

	// RENDER

	return (
		<div style={cssContainer(variant)}
			onClick={onClick}
		>
			{children}
		</div>
	)
}

export default FloatButton

const cssContainer = (variant:number): React.CSSProperties => ({
	position: "absolute",
	bottom: 20, right: 20,

	display: "flex",
	alignItems: "center",
    justifyContent: "center",

	cursor: "pointer",
	padding: 5,
	backgroundColor: layoutSo.state.theme.palette.var[variant].bg,
	color: layoutSo.state.theme.palette.var[variant].fg,

	width: 30, height: 30,
	borderRadius: '50%',

	boxShadow: layoutSo.state.theme.shadows[0],
}
)