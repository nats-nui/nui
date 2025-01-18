import React, { FunctionComponent } from "react"
import cls from "./LinkButton.module.css"
import { TooltipWrapCmp } from "@priolo/jack"



interface Props {
	icon: React.ReactNode
	tooltip?: string
	selected?: boolean
	tabIndex?: number
	renderExtra?: React.ReactNode
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
	onClick,
}) => {

	// STORE

	// HOOKs

	// HANDLER

	// RENDER
	const clsSelect = selected ? cls.selected : ""
	const clsRoot = `${cls.root} ${clsSelect}`
	const clsExtra = `${cls.extra} ${clsSelect}`

	return (
		<TooltipWrapCmp content={tooltip} tabIndex={tabIndex}
			className={clsRoot}
			onClick={onClick}
		>
			{icon}
			{renderExtra && <div className={clsExtra}>{renderExtra}</div>}
		</TooltipWrapCmp>
	)
}

export default LinkButton
