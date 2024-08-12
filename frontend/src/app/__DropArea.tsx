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
		if (!mouseSa.drag?.source?.view) return
		mouseSo.setDrag({
			source: { ...mouseSa.drag.source },
			destination: { group: groupDest, index },
		})
	}
	const handleMouseLeave = () => {
		if (!mouseSa.drag?.source?.view) return
		mouseSo.setDrag({
			source: { ...mouseSa.drag.source },
			destination: null,
		})
	}

	// RENDER
	const dragOver = mouseSa.drag?.destination?.index == index && mouseSa.drag?.destination?.group == groupDest
	const variant = mouseSa.drag?.source?.view?.state?.colorVar ?? 0
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
