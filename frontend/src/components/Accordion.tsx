import { ANIM_TIME_CSS } from "@/types"
import React, { FunctionComponent, useEffect, useRef, useState } from "react"



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
	const ref = useRef<HTMLDivElement>(null)
	const [heightLoc, setHeightLoc] = useState<number>(null)
	useEffect(()=>{
		setTimeout(()=>setHeightLoc(ref.current?.scrollHeight ?? 0), 200)
	},[])

	// HANDLER

	// RENDER
	const currentHeight = !open ? 0 : height ?? heightLoc ?? "auto"

	return (
		<div 
			ref={ref}
			style={cssRoot(currentHeight, height == null)}
		>
			{children}
		</div>
	)
}

export default Accordion

const cssRoot = (height: number | string, noScroll: boolean): React.CSSProperties => ({
	display: "flex", flexDirection: "column",
	//overflowY: "hidden",
	overflowY: noScroll ? "hidden" : "auto",
	transition: `min-height ${ANIM_TIME_CSS}ms, height ${ANIM_TIME_CSS}ms`,
	minHeight: height,
	height: height,
})
