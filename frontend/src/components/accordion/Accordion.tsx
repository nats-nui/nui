import { ANIM_TIME_CSS } from "@/types"
import React, { FunctionComponent, useEffect, useRef, useState } from "react"
import cls from "./Accordion.module.css"



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
		<div ref={ref}
			className={cls.root}
			style={cssRoot(currentHeight, height == null)}
		>
			{children}
		</div>
	)
}

export default Accordion

const cssRoot = (height: number | string, noScroll: boolean): React.CSSProperties => ({
	overflowY: noScroll ? "hidden" : "auto",
	minHeight: height,
	height: height,
})
