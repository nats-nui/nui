import CloseIcon from "@/icons/CloseIcon"
import docSo, { DocState } from "@/stores/docs"
import { ViewStore } from "@/stores/docs/viewBase"
import layoutSo from "@/stores/layout"
import mouseSo from "@/stores/mouse"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent } from "react"
import IconButton from "./buttons/IconButton"
import DetachIcon from "@/icons/DetachIcon"
import { getRoot } from "@/stores/docs/utils/manage"



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
		docSo.remove({ view, anim: true })
	}

	const handleDragStart: React.DragEventHandler = (e) => {
		e.preventDefault();
		mouseSo.setPosition({ x: e.clientX, y: e.clientY })
		mouseSo.startDrag({ srcView: view })
	}
	const handleLinkDetach = () => {
		if (!view.state.linked) return
		const root = getRoot(view)
		if (!root) return
		const rootIndex = docSo.getIndexByView(root)
		docSo.move({ view: view.state.linked, index: rootIndex + 1, anim: true })
	}

	// RENDER
	const doc = view
	if (!doc) return null
	const isDraggable = view.state.draggable
	const haveLinkDetachable = view.state.linked?.state.draggable


	return (
		<div style={{ ...cssRoot, ...style }}
			draggable={isDraggable}
			onDragStart={handleDragStart}
		>
			{icon}
			<span style={cssTitle}>{title}</span>

			<div style={cssButtons} >
				<IconButton
					onClick={handleClose}
				><CloseIcon /></IconButton>

				{haveLinkDetachable && <IconButton
					onClick={handleLinkDetach}
				><DetachIcon /></IconButton>}
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
const cssButtons: React.CSSProperties = {
	display: "flex",
	flexDirection: "column",
}
