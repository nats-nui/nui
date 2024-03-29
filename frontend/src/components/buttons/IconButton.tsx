import React, { FunctionComponent, useState } from "react"
import classes from "./IconButton.module.css"



interface Props {
	onClick?: (e: React.MouseEvent) => void
	children?: React.ReactNode
	effect?: boolean
	className?: string
	style?: React.CSSProperties
}

const IconButton: FunctionComponent<Props> = ({
	onClick,
	children,
	effect,
	className,
	style,
}) => {
	// STORE

	// HOOK
	const [mouseOver, setMouseOver] = useState(false)

	// HANDLER

	// RENDER
	const cls = `${classes.root} ${mouseOver? "color-bg color-text" : ""} ${className}`
	return (
		<div style={style} className={cls}
			onClick={onClick}
			onMouseEnter={effect ? () => setMouseOver(true) : null}
			onMouseLeave={effect ? () => setMouseOver(false) : null}
		>
			{children}
		</div>
	)
}

export default IconButton
