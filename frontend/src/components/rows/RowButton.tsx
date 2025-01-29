import React, { FunctionComponent, useState } from "react"
import cls from "./RowButton.module.css"



interface Props {
	icon?: React.ReactNode
	label?: string
	selected?: boolean
	tabIndex?: number
	renderEnd?: React.ReactElement
	className?: string
	onClick?: (e: React.MouseEvent) => void
	style?: React.CSSProperties
}

const RowButton: FunctionComponent<Props> = ({
	icon,
	label,
	selected,
	tabIndex = 0,
	renderEnd,
	className,
	onClick,
	style,
}) => {

	// STORE

	// HOOK

	// HANDLER
	const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		if (e.code == "Space" || e.code == "Enter") onClick?.(e as any);
	}

	// RENDER
	const clsRoot = `${cls.root} ${selected ? cls.select : ""} ${className ?? ""}`
	return (
		<div className={clsRoot} style={style} tabIndex={tabIndex}
			onClick={onClick}
			onKeyDown={handleKeyDown}
		>
			{icon}
			<div className={cls.label}>
				{label}
			</div>
			{renderEnd}
		</div>
	)
}

export default RowButton

