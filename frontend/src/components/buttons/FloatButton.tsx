import React, { FunctionComponent } from "react"
import layoutSo from "@/stores/layout"



interface Props {
	onClick?: (e: React.MouseEvent) => void
	children?: React.ReactNode
}

const FloatButton: FunctionComponent<Props> = ({
	onClick,
	children,
}) => {
	// STORE

	// HOOK

	// HANDLER

	// RENDER

	return (
		<div style={cssContainer} className="color-bg color-text"
			onClick={onClick}
		>
			{children}
		</div>
	)
}

export default FloatButton

const cssContainer: React.CSSProperties = {
	display: "flex",
	alignItems: "center",
    justifyContent: "center",

	cursor: "pointer",
	padding: 5,

	width: 25, height: 25,
	borderRadius: '50%',

	boxShadow: layoutSo.state.theme.shadows[0],
}