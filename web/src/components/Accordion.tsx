import { ANIM_TIME_CSS } from "@/types"
import React, { FunctionComponent, useRef } from "react"



interface Props {
	open?: boolean
	children?: React.ReactNode
}

const Accordion: FunctionComponent<Props> = ({
	open,
	children
}) => {

	// STORE

	// HOOK
	const ref = useRef(null)

	// HANDLER

	// RENDER
	return (
		<div ref={ref} style={cssRoot(open, ref.current)}>
			{children}
		</div>
	)
}

export default Accordion

const cssRoot = (open: boolean, node:Element): React.CSSProperties => ({
	display: "flex", flexDirection: "column",
	overflowY: "hidden",
	transition: `height ${ANIM_TIME_CSS}ms`,
	height: !open ? 0 : (!node || !node?.scrollHeight ? "auto" : node?.scrollHeight),
	
	
})
