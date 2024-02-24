import React, { FunctionComponent } from "react"



interface Props {
	onClick?: (e: React.MouseEvent) => void
	children?: React.ReactNode
	style?: React.CSSProperties
}

const IconButton: FunctionComponent<Props> = ({
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

export default IconButton

const cssContainer: React.CSSProperties = {
	display: "flex",
	cursor: "pointer",
	padding: 2,
}
