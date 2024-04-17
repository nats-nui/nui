import React, { FunctionComponent, useState } from "react"
import cls from "./Button.module.css"



interface Props {
	select?: boolean
	children?: React.ReactNode

	className?: string
	style?: React.CSSProperties

	disabled?: boolean
	onClick?: (e: React.MouseEvent<HTMLDivElement>, select: boolean) => void
}

const Button: FunctionComponent<Props> = ({
	select,
	children,

	className = "",
	style,

	disabled,
	onClick,
}) => {

	// STORE
	const [mouseOver, setMouseOver] = useState(false)

	// HOOK

	// HANDLER
	const handleEnter = () => setMouseOver(true)
	const handleLeave = () => setMouseOver(false)
	const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
		onClick?.(e, select)
	}

	// RENDER
	const clsRoot = `${(mouseOver || select) ? `color-bg color-text ${cls.select}` : ""} ${cls.root} ${disabled ? cls.disabled : ""} ${className}`

	return (
		<div style={style} className={clsRoot}
			onClick={handleClick}
			onMouseEnter={handleEnter}
			onMouseLeave={handleLeave}
		>
			{children}
		</div>
	)
}

export default Button
