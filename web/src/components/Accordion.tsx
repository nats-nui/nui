import { ANIM_TIME_CSS } from "@/types"
import React, { FunctionComponent, useRef } from "react"



interface Props {
	open?: boolean
	height?: number
	children?: React.ReactNode
}

const Accordion: FunctionComponent<Props> = ({
	open,
	height,
	children,
}) => {

	// STORE

	// HOOK
	const ref = useRef(null)

	// HANDLER

	// RENDER
	const currentHeight = !open ? 0 : height != null ? height : (!ref.current || !ref.current?.scrollHeight ? "auto" : ref.current?.scrollHeight)
	return (
		<div ref={ref} style={cssRoot(currentHeight, height == null)}>
			{children}
		</div>
	)
}

export default Accordion

const cssRoot = (height: number, noScroll: boolean): React.CSSProperties => ({
	display: "flex", flexDirection: "column",
	//overflowY: "hidden",
	overflowY: noScroll ? "hidden" : "auto",
	transition: `min-height ${ANIM_TIME_CSS}ms, height ${ANIM_TIME_CSS}ms`,
	minHeight: height,
	height: height,
})
