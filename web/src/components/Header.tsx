import CloseIcon from "@/icons/CloseIcon"
import DetachIcon from "@/icons/DetachIcon"
import docSo from "@/stores/docs"
import { getRoot } from "@/stores/docs/utils/manage"
import { VIEW_SIZE, ViewStore } from "@/stores/docs/viewBase"
import mouseSo from "@/stores/mouse"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent } from "react"
import IconButton from "./buttons/IconButton"
import Label, { LABEL_TYPES } from "./input/Label"



interface Props {
	store?: ViewStore
}

/** Tipico HEADER con icona e titolo. Lo trovi nel tipico FrameworkCard */
const Header: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	useStore(docSo)

	// HOOK

	// HANDLER
	const handleClose = _ => {
		store.onDestroy()
	}

	const handleDragStart: React.DragEventHandler = (e) => {
		e.preventDefault();
		mouseSo.setPosition({ x: e.clientX, y: e.clientY })
		mouseSo.startDrag({ srcView: store })
	}
	const handleLinkDetach = () => {
		if (!store.state.linked) return
		const root = getRoot(store) ?? store
		const rootIndex = docSo.getIndexByView(root)
		docSo.move({ view: store.state.linked, index: rootIndex + 1, anim: false })
	}
	const handleSizeClick = () => {
		store.setSize(
			store.state.size == VIEW_SIZE.NORMAL ? VIEW_SIZE.ICONIZED : VIEW_SIZE.NORMAL
		)
	}
	const handleFocus = (e) => {
		//e.stopPropagation()
		docSo.focus(store)
	}

	// RENDER
	if (!store) return null
	const isDraggable = store.state.draggable
	const haveLinkDetachable = store.state.linked?.state.draggable
	const title = store.getTitle()
	const subTitle = store.getSubTitle()
	const strIcon = store.getIcon()
	const inRoot = !store.state.parent

	return (
		<div style={cssRoot(store.state.size)}
			draggable={isDraggable}
			onDragStart={handleDragStart}
		>
			{!!strIcon && (
				<div onClick={handleSizeClick}>
					<img src={strIcon} />
				</div>
			)}

			<div style={cssTitle(store.state.size)}>
				<Label
					type={LABEL_TYPES.TITLE}
					onClick={handleFocus}
					style={{ marginLeft: (!inRoot && !strIcon) ? 13 : null}}
				>{title}</Label>

				{subTitle && (
					<Label type={LABEL_TYPES.SUB_TITLE}>{subTitle}</Label>
				)}
			</div>

			{store.state.size != VIEW_SIZE.ICONIZED && (
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
