import TooltipWrapCmp from "@/components/tooltip/TooltipWrapCmp"
import React, { FunctionComponent } from "react"
import cls from "./LinkButton.module.css"



interface Props {
	icon: React.ReactNode
	tooltip?: string
	selected?: boolean
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
	renderExtra,
	onClick,
}) => {

	// STORE

	// HOOKs

	// HANDLER

	// RENDER
	const clsSelect = selected ? cls.selected : ""
	const clsRoot = `${cls.root} ${clsSelect}`
	const clsExtra = `${selected ? cls.selected : "color-bg color-text"} ${cls.extra}`

	return (
		<TooltipWrapCmp content={tooltip}
			className={clsRoot}
			onClick={onClick}
		>
			{icon}
			{renderExtra && <div className={clsExtra}>{renderExtra}</div>}
		</TooltipWrapCmp>
	)
}

export default LinkButton
