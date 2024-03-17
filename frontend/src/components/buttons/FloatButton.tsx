import React, { FunctionComponent } from "react"



interface Props {
	onClick?: (e: React.MouseEvent) => void
	children?: React.ReactNode
	disabled?: boolean
	style?: React.CSSProperties
}

const FloatButton: FunctionComponent<Props> = ({
	onClick,
	children,
	disabled,
	style,
}) => {
	// STORE

	// HOOK

	// HANDLER
	const handleClick = (e) => {
		if ( disabled ) return
		onClick?.(e)
	}


	// RENDER

	return (
		<div style={style} 
			className={`btt-float ${disabled ? "btt-disabled" : "color-bg color-text"}`}
			onClick={handleClick}
		>
			{children}
		</div>
	)
}

export default FloatButton
