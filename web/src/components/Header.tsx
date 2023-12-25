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
		view.onDestroy()
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
		//e.stopPropagation()
		docSo.focus(view)
	}

	// RENDER
	if (!view) return null
	const isDraggable = view.state.draggable
	const haveLinkDetachable = view.state.linked?.state.draggable
	const title = view.getTitle()
	const subTitle = view.getSubTitle()
	const strIcon = view.getIcon()

	return (
		<div style={{ ...cssRoot(view.state.size), ...style }}
			draggable={isDraggable}
			onDragStart={handleDragStart}
		>
			{!!strIcon && (
				<div onClick={handleSizeClick}>
					<img src={strIcon} />
				</div>
			)}

			<div style={cssTitle(view.state.size)}>
				<Label
					type={LABEL_TYPES.TITLE}
					onClick={handleFocus}
				>{title}</Label>

				{subTitle && (
					<Label type={LABEL_TYPES.SUB_TITLE}>{subTitle}</Label>
				)}
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

const cssRoot = (size: VIEW_SIZE): React.CSSProperties => ({
	display: "flex",
	height: size != VIEW_SIZE.ICONIZED ? 48 : null,
	flexDirection: size != VIEW_SIZE.ICONIZED ? null : "column",
	alignItems: "flex-start",
})

const cssTitle = (size: VIEW_SIZE): React.CSSProperties => {
	if (size == VIEW_SIZE.ICONIZED) {
		return {
			display: "flex", flex: 1,
			writingMode: "vertical-lr",
			flexDirection: "column-reverse",
			alignSelf: "center",
		}
	} else {
		return {
			display: "flex", flex: 1,
			flexDirection: "column",
			width: 0,
		}
	}
}

const cssButtons: React.CSSProperties = {
	display: "flex",
	flexDirection: "column",
}
