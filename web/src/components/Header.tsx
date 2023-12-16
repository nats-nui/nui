import CloseIcon from "@/icons/CloseIcon"
import docSo, { DocState } from "@/stores/docs"
import { VIEW_SIZE, ViewStore } from "@/stores/docs/viewBase"
import layoutSo from "@/stores/layout"
import mouseSo from "@/stores/mouse"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent } from "react"
import IconButton from "./buttons/IconButton"
import DetachIcon from "@/icons/DetachIcon"
import { getRoot } from "@/stores/docs/utils/manage"
import { getID } from "@/stores/docs/utils/factory"



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
		const root = getRoot(view) ?? view
		const rootIndex = docSo.getIndexByView(root)
		docSo.move({ view: view.state.linked, index: rootIndex + 1, anim: false })
	}
	const handleSizeClick = () => {
		view.setSize( 
			view.state.size == VIEW_SIZE.NORMAL ? VIEW_SIZE.ICONIZED : VIEW_SIZE.NORMAL
		)
	}
	const handleFocus = (e) => {
		e.stopPropagation()
		const elm = document.getElementById(getID(view.state))
		elm?.scrollIntoView({ behavior: "smooth", block: "center" })
	}

	// RENDER
	if (!view) return null
	const isDraggable = view.state.draggable
	const haveLinkDetachable = view.state.linked?.state.draggable
	const strTitle = title ?? view.getTitle()

	return (
		<div style={{ ...cssRoot, ...style }}
			draggable={isDraggable}
			onDragStart={handleDragStart}
		>
			<div onClick={handleSizeClick}>
				{icon}
			</div>
			<span style={cssTitle}
				onClick={handleFocus}
			>{strTitle}</span>

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
