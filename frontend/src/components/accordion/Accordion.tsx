import { ANIM_TIME_CSS } from "@/types"
import React, { FunctionComponent, useEffect, useLayoutEffect, useRef, useState } from "react"
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
	useLayoutEffect(() => {
		if (open) {
			ref.current.style.height = null
		} else {
			ref.current.style.height = "0px"
		}
	}, [])
	useEffect(() => {
		if (open) {
			ref.current.style.height = `${ref.current?.scrollHeight}px`
			setTimeout(() => ref.current.style.height = "", 300)
		} else {
			if (ref.current.style.height == "0px") return
			if (ref.current.style.height == "") {
				ref.current.style.height = `${ref.current?.scrollHeight}px`
				requestAnimationFrame(()=>ref.current.style.height = `0px`)
			}
		}
	}, [open])


	// HANDLER

	// RENDER

	return (
		<div ref={ref}
			className={cls.root}
			style={cssRoot(height == null)}
		>
			{children}
		</div>
	)
}

export default Accordion

const cssRoot = (noScroll: boolean): React.CSSProperties => ({
	overflowY: noScroll ? "hidden" : "auto",
})
