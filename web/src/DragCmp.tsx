import mouseSo, { MouseState } from "@/stores/mouse"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"



const DragCmp: FunctionComponent = () => {

	// STORES
	const mouseSa = useStore(mouseSo) as MouseState

	// HOOKS


	// HANDLERS

	// RENDER
	if ( !mouseSa.position ) return null
	return <div
		style={{
			pointerEvents: "none",
			position: 'absolute',
			left: mouseSa.position.x,
			top: mouseSa.position.y,
			backgroundColor: "white",
			zIndex: 99999,
		}}
	>CIAO</div>
}

export default DragCmp
