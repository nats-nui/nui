import mouseSo, { MouseState } from "@/stores/mouse"
import { useStore } from "@priolo/jon"
import { DragEvent, FunctionComponent } from "react"
import { ViewState, ViewStore } from "./stores/docs/viewBase"
import { DOC_ANIM } from "./types"
import layoutSo from "@/stores/layout"



interface Props {
	index?: number
	viewSo?: ViewStore
}

const DropArea: FunctionComponent<Props> = ({
	index,
	viewSo,
}) => {

	// STORES
	const mouseSa = useStore(mouseSo) as MouseState
	const viewSa =  viewSo  ? useStore(viewSo) as ViewState : null

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
	const styRoot = {
		...cssRoot,
		...(dragOver && cssDragOver),
		...((viewSa?.docAnim == DOC_ANIM.EXIT || viewSa?.docAnim == DOC_ANIM.EXITING) && { width: 0 })
	}
	const styLine = { ...cssLine, ...(dragOver && cssLineDragOver)}

	return <div style={styRoot} draggable={false}
		onMouseOver={handleMouseOver}
		onMouseLeave={handleMouseLeave}
	>
		<div style={styLine} />
	</div>

}

export default DropArea

const cssRoot = {
	display: "flex",
	width: 25,
	//backgroundColor: "green",
	transition: 'width 200ms ease-in-out',
	justifyContent: 'center',
}

const cssDragOver: React.CSSProperties = {
	width: 40,
}

const cssLine: React.CSSProperties = {
	transition: 'background-color 300ms',
	backgroundColor: "transparent",
	width: 5,
	borderRadius: 3,
	marginLeft: 6,
	
}
const cssLineDragOver: React.CSSProperties = {
	backgroundColor: layoutSo.state.theme.palette.bg.acid[1],
}