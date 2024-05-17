import mouseSo, { MouseState } from "@/stores/mouse"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect, useState } from "react"
import { Position } from "../stores/mouse/utils"
import { ANIM_TIME } from "../types"
import cls from "./DragCmp.module.css"



const DragCmp: FunctionComponent = () => {

	// STORES
	const mouseSa = useStore(mouseSo) as MouseState

	// HOOKS
	const [hide, setHide] = useState(true)
	const inShow = mouseSa.drag != null
	useEffect(() => {
		if (inShow == false) {
			setTimeout(() => setHide(true), ANIM_TIME)
		} else {
			setHide(false)
		}
	}, [inShow])

	// HANDLERS

	// RENDER
	const variant = mouseSa.drag?.source?.view?.state?.colorVar ?? 0
	const pos = mouseSa.position
	const clsRoot = `var${variant} color-bg color-text ${cls.root} ${inShow ? cls.show : ""} ${hide ? cls.hide : ""}`

	return <div
		className={clsRoot}
		style={cssRoot(pos)}
	>
		{mouseSa.drag?.source?.view?.getTitle() ?? "???"}
	</div>
}

export default DragCmp

const cssRoot = (pos: Position): React.CSSProperties => ({
	left: pos?.x,
	top: pos?.y,
})
