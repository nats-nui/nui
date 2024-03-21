import React, { FunctionComponent } from "react"
import cls from "./ActionGroup.module.css"



interface Props {
	children: React.ReactNode
	className?: string
	style?: React.CSSProperties
}

/**
 * banda superiore di una CARD dove sono presenti i bottoni
 */
const ActionGroup: FunctionComponent<Props> = ({
	children,
	className,
	style,
}) => {

	// STORE

	// HOOKs

	// HANDLER

	// RENDER
	if (!children) return null
	const clsRoot = `${cls.root} ${className}`

	return <div className={clsRoot} style={style}>
		{children}
	</div>
}

export default ActionGroup
