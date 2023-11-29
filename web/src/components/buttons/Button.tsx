import React, { FunctionComponent } from "react"
import layoutSo from "@/stores/layout"



interface Props {
	label?: string
	onClick?: (e:React.MouseEvent) => void
}

const Button: FunctionComponent<Props> = ({
	label,
	onClick,
}) => {

	// STORE

	// HOOK

	// HANDLER

	// RENDER
	return (
		<div style={cssRoot}
			onClick={onClick}
		>
			<div style={cssLabel}>{label}</div>
		</div>
	)
}

export default Button

const cssRoot:React.CSSProperties = {
	backgroundColor: layoutSo.state.theme.palette.bg.acid,
	color: layoutSo.state.theme.palette.fg.acid,
	cursor: "pointer",
	borderRadius: 10,
	padding: '3px 6px',
}

const cssLabel:React.CSSProperties = {
	...layoutSo.state.theme.texts.button,
}
