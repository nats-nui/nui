import React, { FunctionComponent } from "react"
import cls from "./ElementRow.module.css"



interface Props {
	selected?: boolean
	title: string
	icon?: React.ReactNode
	subtitle?: string
	tabIndex?: number
	onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
}

/**
 * riga generica di lista figa
 */
const ElementRow: FunctionComponent<Props> = ({
	title,
	subtitle,
	icon,
	selected,
	tabIndex = 0,
	onClick,
}) => {

	// STORE

	// HOOKs

	// HANDLER
	const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		if (e.code === "Space" || e.code === "Enter") {
			onClick?.(e as any);
		}
	}

	// RENDER
	if (!title) return null
	const clsRoot = `${cls.root} ${selected ? cls.select : ""}`

	return <div className={clsRoot} tabIndex={tabIndex}
		onClick={onClick}
		onKeyDown={handleKeyDown}
	>
		{icon}
		<div className={cls.label}>
			<div className={cls.title}>
				{title}
			</div>
			<div className={cls.subtitle}>
				<div>{subtitle}</div>
			</div>
		</div>
	</div>
}

export default ElementRow
