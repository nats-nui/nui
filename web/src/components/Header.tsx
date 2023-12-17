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
import Label, { LABEL_TYPES } from "./input/Label"



interface Props {
	view?: ViewStore
	style?: React.CSSProperties
}

const Header: FunctionComponent<Props> = ({
	view,
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
	const title = view.getTitle()
	const subTitle = view.getSubTitle()
	const strIcon = view.getIcon()

	return (
		<div style={{ 
			display: "flex",
			height: view.state.size != VIEW_SIZE.ICONIZED ? 48 : null, 
			flexDirection: view.state.size != VIEW_SIZE.ICONIZED ? null : "column", 
			alignItems: "flex-start", 
			...style 
		}}
			draggable={isDraggable}
			onDragStart={handleDragStart}
		>

			{!!strIcon && (
				<div onClick={handleSizeClick}>
					<img src={strIcon} />
				</div>
			)}

			<div style={{
				display: "flex", flex: 1,
				writingMode: view.state.size != VIEW_SIZE.ICONIZED ? null : "vertical-lr",
				flexDirection: view.state.size != VIEW_SIZE.ICONIZED ?  "column": "column-reverse",
				alignSelf: view.state.size != VIEW_SIZE.ICONIZED ?  null: "center",
			}}>
				<Label type={LABEL_TYPES.TITLE}
					onClick={handleFocus}
				>{title}</Label>
				<Label type={LABEL_TYPES.SUB_TITLE}
				>{subTitle}</Label>
			</div>

			{view.state.size != VIEW_SIZE.ICONIZED && (
				<div style={cssButtons} >
					<IconButton
						onClick={handleClose}
					><CloseIcon /></IconButton>

					{haveLinkDetachable && <IconButton
						onClick={handleLinkDetach}
					><DetachIcon /></IconButton>}
				</div>
			)}
		</div>
	)
}

export default Header



const cssButtons: React.CSSProperties = {
	display: "flex",
	flexDirection: "column",
}
