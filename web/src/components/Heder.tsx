import CloseIcon from "@/icons/CloseIcon"
import docSo, { DocState } from "@/stores/docs"
import { ViewStore } from "@/stores/docs/viewBase"
import layoutSo from "@/stores/layout"
import mouseSo from "@/stores/mouse"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent } from "react"
import IconButton from "./buttons/IconButton"
import DetachIcon from "@/icons/DetachIcon"



interface Props {
	view?: ViewStore
	title?: string
	icon?: React.ReactNode

	style?: React.CSSProperties
}

const Header: FunctionComponent<Props> = ({
	view,
	title,
	icon,
	style,
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
		<div style={{ ...cssRoot, ...style }}
			draggable={isDraggable}
			onDragStart={handleDragStart}
		>
			{icon}
			<span style={cssTitle}>{title}</span>
			<div style={{ display: "flex", flexDirection: "column" }} >
				<IconButton style={{ margin: "1px 5px" }} onClick={handleClose}>
					<CloseIcon />
				</IconButton>
				<IconButton style={{ margin: "0px 5px" }}>
					<DetachIcon />
				</IconButton>
			</div>
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
	//color: "#FFF",
	overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
}
