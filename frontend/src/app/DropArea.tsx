import mouseSo, { MouseState } from "@/stores/mouse"
import { useStore } from "@priolo/jon"
import { DragEvent, FunctionComponent } from "react"
import { ViewState, ViewStore } from "../stores/stacks/viewBase"
import { DOC_ANIM } from "../types"
import cls from "./DropArea.module.css"
import { CardsStore } from "@/stores/docs/cards"



interface Props {
	groupDest: CardsStore
	index?: number
	isLast?: boolean
	viewSo?: ViewStore
	style?: React.CSSProperties
}

const DropArea: FunctionComponent<Props> = ({
	groupDest,
	index,
	isLast,
	viewSo,
	style,
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
			groupDest,
		})
	}
	const handleMouseLeave = () => {
		if (mouseSa.drag?.srcView == null) return
		mouseSo.setDrag({
			...mouseSa.drag,
			index: null,
			groupDest: null,
		})
	}

	// RENDER
	const dragOver = mouseSa.drag?.index == index && mouseSa.drag?.groupDest == groupDest
	const variant = mouseSa.drag?.srcView?.state.colorVar ?? 0
	const inExit = viewSa?.docAnim == DOC_ANIM.EXIT || viewSa?.docAnim == DOC_ANIM.EXITING
	const clsRoot = `${cls.root} ${dragOver ? cls.in_dragover : ""} ${inExit ? cls.in_exit : ""} ${isLast ? cls.is_last : ""} var${variant}`
	const clsLine = `${cls.line} ${dragOver ? "color-bg" : ""}`

	return <div draggable={false}
		className={clsRoot}
		style={style}
		onMouseOver={handleMouseOver}
		onMouseLeave={handleMouseLeave}
	>
		<div className={clsLine} />
	</div>
}

export default DropArea
