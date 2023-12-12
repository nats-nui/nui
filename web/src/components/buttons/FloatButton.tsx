import React, { FunctionComponent } from "react"
import layoutSo from "@/stores/layout"


interface Props {
	onClick?: (e: React.MouseEvent) => void
	children?: React.ReactNode
	style?: React.CSSProperties
}

const FloatButton: FunctionComponent<Props> = ({
	onClick,
	children,
	style,
}) => {
	// STORE

	// HOOK

	// HANDLER

	// RENDER

	return (
		<div style={{ ...cssContainer, ...style }}
			onClick={onClick}
		>
			{children}
		</div>
	)
}

export default FloatButton

const cssContainer: React.CSSProperties = {
	position: "absolute",
	bottom: 20, right: 20,

	display: "flex",
	alignItems: "center",
    justifyContent: "center",

	cursor: "pointer",
	padding: 5,
	backgroundColor: layoutSo.state.theme.palette.var[1].bg,
	color: layoutSo.state.theme.palette.var[1].fg,

	width: 30, height: 30,
	borderRadius: '50%',

	boxShadow: layoutSo.state.theme.shadows[0],
}
