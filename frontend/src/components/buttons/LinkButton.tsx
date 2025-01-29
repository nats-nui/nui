import React, { FunctionComponent } from "react"
import cls from "./LinkButton.module.css"
import { TooltipWrapCmp } from "@priolo/jack"



interface Props {
	icon: React.ReactNode
	tooltip?: string
	selected?: boolean
	tabIndex?: number
	renderExtra?: React.ReactNode
	className?: string
	onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
}

/**
 * Lo STACK di una collezione di CONNECTIONs
 */
const LinkButton: FunctionComponent<Props> = ({
	icon,
	tooltip,
	selected,
	tabIndex = 0,
	renderExtra,
	className,
	onClick,
}) => {

	// STORE

	// HOOKs

	// HANDLER
		const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
			if (e.code == "Space" || e.code == "Enter") onClick?.(e as any);
		}
	

	// RENDER
	const clsSelect = selected ? cls.selected : ""
	const clsRoot = `${cls.root} ${clsSelect} ${className ?? ""}`
	const clsExtra = `${cls.extra} ${clsSelect}`

	return (
		<TooltipWrapCmp content={tooltip} tabIndex={tabIndex}
			className={clsRoot}
			onClick={onClick}
			onKeyDown={handleKeyDown}
		>
			{icon}
			{renderExtra && <div className={clsExtra}>{renderExtra}</div>}
		</TooltipWrapCmp>
	)
}

export default LinkButton
