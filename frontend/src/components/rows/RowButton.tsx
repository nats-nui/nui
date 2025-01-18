import React, { FunctionComponent, useState } from "react"
import cls from "./RowButton.module.css"



interface Props {
	icon?: React.ReactNode
	label?: string
	selected?: boolean
	tabIndex?: number
	renderEnd?: React.ReactElement
	onClick?: (e: React.MouseEvent) => void
	style?: React.CSSProperties
}

const RowButton: FunctionComponent<Props> = ({
	icon,
	label,
	selected,
	tabIndex = 0,
	renderEnd,
	onClick,
	style,
}) => {

	// STORE
	const [mouseOver, setMouseOver] = useState(false)

	// HOOK

	// HANDLER
	const handleEnter = () => setMouseOver(true)
	const handleLeave = () => setMouseOver(false)

	// RENDER
	const clsRoot = `${cls.root} ${selected ? cls.select : ""}`
	return (
		<div className={clsRoot} style={style} tabIndex={tabIndex}
			onClick={onClick}
			onMouseEnter={handleEnter}
			onMouseLeave={handleLeave}
		>
			{icon}
			<div className={cls.label}>{label}</div>
			{renderEnd}
		</div>
	)
}

export default RowButton

