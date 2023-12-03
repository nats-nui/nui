import mouseSo, { MouseState, Position } from "@/stores/mouse"
import { useStore } from "@priolo/jon"
import { useEffect, useState, useMemo, FunctionComponent } from "react"
import { ANIM_TIME } from "./types"



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
	const styRoot: React.CSSProperties = {
		...cssRoot,
		...cssPosition(mouseSa.position),
		...(inShow ? cssInShow : cssInHide),
		...(hide ? { visibility: "hidden" } : {})
	}

	return <div style={styRoot}>
		CIAO
	</div>
}

export default DragCmp

const cssRoot: React.CSSProperties = {
	pointerEvents: "none",
	position: 'absolute',
	backgroundColor: "white",
	zIndex: 99999,
	transition: 'opacity 2s',
}

const cssPosition = (pos: Position): React.CSSProperties => ({
	left: pos?.x,
	top: pos?.y,
})

const cssInShow = {
	opacity: 1,
}
const cssInHide = {
	opacity: 0,
}
