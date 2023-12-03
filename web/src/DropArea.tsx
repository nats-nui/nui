import mouseSo, { MouseState } from "@/stores/mouse"
import { useStore } from "@priolo/jon"
import { DragEvent, FunctionComponent } from "react"
import { ViewState, ViewStore } from "./stores/docs/viewBase"
import { DOC_ANIM } from "./types"



interface Props {
	index?: number
	view?: ViewStore
}

const DropArea: FunctionComponent<Props> = ({
	index,
	view,
}) => {

	// STORES
	const mouseSa = useStore(mouseSo) as MouseState
	const viewSa =  view  ? useStore(view ?? {}) as ViewState : null

	// HOOKS

	// HANDLERS
	const handleMouseOver = (_: DragEvent<HTMLDivElement>) => {
		if (mouseSa.drag?.srcView == null) return
		mouseSo.setDrag({
			...mouseSa.drag,
			index,
		})
	}
	const handleMouseLeave = () => {
		if (mouseSa.drag?.srcView == null) return
		mouseSo.setDrag({
			...mouseSa.drag,
			index: null,
		})
	}

	// RENDER
	const dragOver = mouseSa.drag?.index == index
	const css = {
		...cssDroppable(false),
		...(dragOver && cssDragOver),
		...((viewSa?.docAnim == DOC_ANIM.EXIT || viewSa?.docAnim == DOC_ANIM.EXITING) && { width: 0 })

	}

	return <div style={css} draggable={false}
		onMouseOver={handleMouseOver}
		onMouseLeave={handleMouseLeave}
	/>

}

export default DropArea

const cssDroppable = (last: boolean): React.CSSProperties => ({
	width: last ? 200 : 35,
	//backgroundColor: "green",
	transition: 'width 0.4s ease-in-out',
})

const cssDragOver: React.CSSProperties = {
	width: 100,
	transition: 'width 0.4s ease-in-out',
}