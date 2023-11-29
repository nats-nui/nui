import React, { FunctionComponent } from "react"


interface Props {
	onClick?: (e:React.MouseEvent) => void

	style?: React.CSSProperties
}

const CloseBtt: FunctionComponent<Props> = ({
	onClick,
	style,
}) => {
	// STORE

	// HOOK

	// HANDLER

	// RENDER

	return (
		<div style={{...cssContainer, ...style}}
			onClick={onClick}
		>
			<svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path id="Vector 1" d="M1 1L9 9M1 9L9 1" stroke="white"/>
			</svg>
		</div>
	)
}

export default CloseBtt

const cssContainer: React.CSSProperties = {
	cursor: "pointer",
	padding: 5,
}
