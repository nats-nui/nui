import CloseIcon from "@/icons/CloseIcon"
import DetachIcon from "@/icons/DetachIcon"
import docSo from "@/stores/docs"
import { getRoot } from "@/stores/docs/utils/manage"
import { ViewStore } from "@/stores/stacks/viewBase"
import mouseSo from "@/stores/mouse"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent, useState } from "react"
import IconButton from "./buttons/IconButton"
import Label, { LABELS } from "./input/Label"
import AnchorIcon from "@/icons/AnchorIcon"
import { VIEW_SIZE } from "@/stores/stacks/utils"
import IconizedIcon from "@/icons/IconizeIcon"



interface Props {
	store?: ViewStore
}

/** Tipico HEADER con icona e titolo. Lo trovi nel tipico FrameworkCard */
const Header: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	const docSa = useStore(docSo)

	// HOOK
	const [enter, setEnter] = useState(false)

	// HANDLER
	const handleClose = () => store.onDestroy()
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
			store.state.size == VIEW_SIZE.NORMAL ? VIEW_SIZE.COMPACT : VIEW_SIZE.NORMAL
		)
	}
	const handleAnchor = () => {
		if (!isAnchored) docSo.anchor(store); else docSo.unanchor(store)
	}
	const handleFocus = () => {
		//e.stopPropagation()
		docSo.focus(store)
	}
	const handleToggleIconize = () => {
		if (!isIconized) docSo.iconize(store); else docSo.uniconize(store)
	}

	// RENDER
	if (!store) return null
	const isDraggable = store.state.draggable
	const haveLinkDetachable = store.state.linked?.state.draggable
	const title = store.getTitle()
	const subTitle = store.getSubTitle()
	const strIcon = store.getIcon()
	const inRoot = !store.state.parent
	const isAnchored = docSo.isAnchored(store)
	const isCompact = store.state.size == VIEW_SIZE.COMPACT
	const isIconized = docSo.isIconized(store.state.uuid)
	const showBttAnchor = inRoot && (enter || isAnchored)
	const showBttClose = !store.state.unclosable
	const showBttIconize = inRoot && enter && store.state.iconizzable

	return (
		<div style={cssRoot(store.state.size)}
			draggable={isDraggable}
			onDragStart={handleDragStart}
			onMouseEnter={() => setEnter(true)}
			onMouseLeave={() => setEnter(false)}
		>
			{!!strIcon && (
				<div onClick={handleSizeClick}>
					<img src={strIcon} />
				</div>
			)}

			<div style={cssTitle(store.state.size)}>
				<Label
					type={LABELS.TITLE}
					onClick={handleFocus}
					style={{ marginLeft: (!inRoot && !strIcon) ? 13 : null, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
				>{title}</Label>

				{subTitle && (
					<Label type={LABELS.SUB_TITLE}>{subTitle}</Label>
				)}
			</div>

			{!isCompact && (
				<div style={cssButtons}>
					<div style={{ display: "flex" }}>
						{showBttIconize && (
							<IconButton
								onClick={handleToggleIconize}
							><IconizedIcon /></IconButton>
						)}
						{showBttAnchor && (
							<IconButton
								onClick={handleAnchor}
							><AnchorIcon /></IconButton>
						)}
						{showBttClose && (
							<IconButton
								onClick={handleClose}
							><CloseIcon /></IconButton>
						)}
					</div>
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
	height: size != VIEW_SIZE.COMPACT ? 48 : null,
	flexDirection: size != VIEW_SIZE.COMPACT ? null : "column",
	alignItems: "flex-start",
})

const cssTitle = (size: VIEW_SIZE): React.CSSProperties => {
	if (size == VIEW_SIZE.COMPACT) {
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
	alignItems: 'flex-end',
}
