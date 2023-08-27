import docSo, { DocState } from "@/stores/docs"
import { ViewStore } from "@/stores/docs/docBase"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent } from "react"
import CloseBtt from "./buttons/CloseBtt"
import mouseSo from "@/stores/mouse"

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
	const docSa = useStore(docSo) as DocState

	// HOOK

	// HANDLER
	const handleClose = _ => {
		docSo.remove(view)
	}

	const handleDragStart: React.DragEventHandler = (e) => {
		e.preventDefault();
		mouseSo.startDrag({ srcView: view })
	}
	
	const handleClick = (e) => {
		docSo.showStack(view)
	}

	// RENDER
	const doc = view
	if (!doc) return null
	const isDraggable = true //view.state.draggable

	return (
		<div style={cssContainer}
			draggable={isDraggable}
			onDragStart={handleDragStart}
			onClick={handleClick}
		>
			{icon}
			<span style={cssLabel}>{title}</span>
			<CloseBtt onClick={handleClose} />
		</div>
	)
}

export default Header

const cssContainer: React.CSSProperties = {
	display: "flex",
	alignItems: "center",
	height: "48px",
}
const cssLabel: React.CSSProperties = {
	flex: 1,
	fontFamily: "Darker Grotesque",
	fontSize: "22px",
	fontWeight: 800,
	color: "#FFF",
	overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
}
