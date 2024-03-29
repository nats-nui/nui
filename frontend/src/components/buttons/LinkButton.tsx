import TooltipWrapCmp from "@/components/TooltipWrapCmp"
import React, { FunctionComponent } from "react"
import cls from "./LinkButton.module.css"



interface Props {
	icon: React.ReactNode
	tooltip?: string
	selected?: boolean
	onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
}

/**
 * Lo STACK di una collezione di CONNECTIONs
 */
const LinkButton: FunctionComponent<Props> = ({
	icon,
	tooltip,
	selected,
	onClick,
}) => {

	// STORE

	// HOOKs

	// HANDLER

	// RENDER
	const clsRoot = `${cls.root} ${selected ? cls.selected : ""}`

	return (
		<TooltipWrapCmp content={tooltip}
			className={clsRoot}
			onClick={onClick}
		>
			{icon}
		</TooltipWrapCmp>
	)
}

export default LinkButton
