import layoutSo from "@/stores/layout"
import mouseSo, { MouseState } from "@/stores/mouse"
import { useStore } from "@priolo/jon"
import { DragEvent, FunctionComponent } from "react"
import { ViewState, ViewStore } from "../stores/stacks/viewBase"
import { DOC_ANIM } from "../types"
import docSo from "@/stores/docs"



interface Props {
	index?: number
	isLast?: boolean
	viewSo?: ViewStore
}

const DropArea: FunctionComponent<Props> = ({
	index,
	isLast,
	viewSo,
}) => {

	// STORES
	const mouseSa = useStore(mouseSo) as MouseState
	const viewSa = viewSo ? useStore(viewSo) as ViewState : null

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
	const variant = mouseSa.drag?.srcView?.getColorVar() ?? 0
	const inExit = viewSa?.docAnim == DOC_ANIM.EXIT || viewSa?.docAnim == DOC_ANIM.EXITING
	
	return <div style={cssRoot(dragOver, inExit, isLast)} draggable={false}
		onMouseOver={handleMouseOver}
		onMouseLeave={handleMouseLeave}
	>
		<div style={cssLine(dragOver, variant)} />
	</div>
}

export default DropArea

const cssRoot = (dragOver: boolean, inExit: boolean, isLast: boolean): React.CSSProperties => ({
	display: "flex",
	width: inExit ? 0 : dragOver ? 40 : 25,
	...isLast ? {
		flex: 1,
		marginLeft: 15,
		justifyContent: 'flex-start',
	} : {
		justifyContent: 'center',
	},
	//backgroundColor: "green",
	transition: 'width 200ms ease-in-out',
})


const cssLine = (dragOver: boolean, variant: number): React.CSSProperties => ({
	transition: 'background-color 300ms',
	backgroundColor: dragOver ? layoutSo.state.theme.palette.var[variant].bg : "transparent",
	//backgroundColor: layoutSo.state.theme.palette.var[variant].bg,
	width: 5,
	borderRadius: 3,
	marginLeft: 6,
})
