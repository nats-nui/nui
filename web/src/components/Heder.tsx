import docSo, { DocState } from "@/stores/docs"
import { ViewStore } from "@/stores/docs/viewBase"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent } from "react"
import CloseBtt from "./buttons/CloseBtt"
import mouseSo from "@/stores/mouse"
import layoutSo from "@/stores/layout"



interface Props {
	view?: ViewStore
	title?: string
	icon?: React.ReactNode
}

const Header: FunctionComponent<Props> = ({
	view,
	title,
	icon,
}) => {

	// STORE
	useStore(docSo) as DocState

	// HOOK

	// HANDLER
	const handleClose = _ => {
		docSo.removeWithAnim(view)
	}

	const handleDragStart: React.DragEventHandler = (e) => {
		e.preventDefault();
		mouseSo.setPosition({ x: e.clientX, y: e.clientY })
		mouseSo.startDrag({ srcView: view })
	}

	// RENDER
	const doc = view
	if (!doc) return null
	const isDraggable = true //view.state.draggable

	return (
		<div style={cssRoot}
			draggable={isDraggable}
			onDragStart={handleDragStart}
		>
			{icon}
			<span style={cssTitle}>{title}</span>
			<CloseBtt style={{margin: "3px 5px"}} onClick={handleClose} />
		</div>
	)
}

export default Header

const cssRoot: React.CSSProperties = {
	display: "flex",
	alignItems: "flex-start",
	height: "48px",
}
const cssTitle: React.CSSProperties = {
	...layoutSo.state.theme.texts.title,
	flex: 1,
	fontFamily: "Darker Grotesque",
	fontSize: "22px",
	fontWeight: 800,
	color: "#FFF",
	overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
}
