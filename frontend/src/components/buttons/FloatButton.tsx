import React, { FunctionComponent } from "react"
import classes from "./FloatButton.module.css"



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
	const cls = `${classes.root} ${disabled ? classes.disabled : "color-bg color-text"}`
	return (
		<div style={style} 
			className={cls}
			onClick={handleClick}
		>
			{children}
		</div>
	)
}

export default FloatButton
