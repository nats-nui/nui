import React, { FunctionComponent, useLayoutEffect, useRef } from "react"
import cls from "./Accordion.module.css"



interface Props {
	open?: boolean
	children?: React.ReactNode
	
	height?: number
	style?: React.CSSProperties
	className?: string
}

const Accordion: FunctionComponent<Props> = ({
	open,
	children,

	height,
	style,
	className = "",
}) => {

	// STORE

	// HOOK
	const ref = useRef<HTMLDivElement>(null)

	//  appena componente è istanziato. decide l'altezza
	useLayoutEffect(() => {
		ref.current.style.height = open ? "" : "0px"
	}, [])

	useLayoutEffect(() => {
		if (open) {
			if (ref.current.style.height == "") return
			ref.current.style.height = `${ref.current?.scrollHeight}px`
			setTimeout(() => ref.current.style.height = "", 300)
		} else {
			if (ref.current.style.height == "0px") return
			if (ref.current.style.height == "") {
				ref.current.style.height = `${ref.current?.scrollHeight}px`
				requestAnimationFrame(() => ref.current.style.height = `0px`)
			}
		}
	}, [open])


	// HANDLER

	// RENDER
	const clsRoot = `${cls.root} ${height == null ? "" : cls.scroll} ${className}`
	return (
		<div ref={ref}
			style={style}
			className={clsRoot}
		>
			{children}
		</div>
	)
}

export default Accordion
