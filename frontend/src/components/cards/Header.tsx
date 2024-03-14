import AnchorIcon from "@/icons/AnchorIcon"
import CloseIcon from "@/icons/CloseIcon"
import DetachIcon from "@/icons/DetachIcon"
import IconizedIcon from "@/icons/IconizeIcon"
import docSo from "@/stores/docs"
import { getRoot } from "@/stores/docs/utils/manage"
import mouseSo from "@/stores/mouse"
import { VIEW_SIZE } from "@/stores/stacks/utils"
import { ViewStore } from "@/stores/stacks/viewBase"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent, useState } from "react"
import IconButton from "../buttons/IconButton"
import CardIcon from "./CardIcon"
import TooltipWrapCmp from "../TooltipWrapCmp"



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
	const handleClose = () => store.onRemoveFromDeck()
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
		if (!isIconized) docSo.pinned(store); else docSo.unpinned(store)
	}

	// RENDER
	if (!store) return null
	const isDraggable = store.state.draggable
	const haveLinkDetachable = store.state.linked?.state.draggable
	const title = store.getTitle()
	const subTitle = store.getSubTitle()
	const inRoot = !store.state.parent
	const variant = store.state.colorVar
	const isAnchored = docSo.isAnchored(store)
	const isCompact = store.state.size == VIEW_SIZE.COMPACT
	const isIconized = docSo.isPinned(store.state.uuid)
	const showBttAnchor = inRoot && (enter || isAnchored)
	const showBttClose = !store.state.unclosable
	const showBttIconize = inRoot && enter && store.state.pinnable

	const tooltip = isCompact ?
		<div>
			<div className="lbl-header-title">{title}</div>
			<div className="lbl-header-subtitle">{subTitle}</div>
		</div>
		: null

	return (
		<div style={cssRoot(store.state.size)}
			draggable={isDraggable}
			onDragStart={handleDragStart}
			onMouseEnter={() => setEnter(true)}
			onMouseLeave={() => setEnter(false)}
		>

			{!!store.state.type && (
				<div onClick={handleSizeClick} className="cliccable"
					style={{ margin: 8, alignSelf: "center" }}
				>
					<TooltipWrapCmp content={tooltip} >
						<CardIcon
							type={store.state.type}
						/>
					</TooltipWrapCmp>
				</div>
			)}

			{!isCompact && <>

				<div style={cssTitle(store.state.size)}>
					<div className="lbl-header-title cliccable"
						style={{ marginTop: 3 }}
						onClick={handleFocus}
					>{title}</div>
					{subTitle && (
						<div className="lbl-header-subtitle">
							{subTitle}
						</div>
					)}
				</div>

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

			</>}
		</div>
	)
}

export default Header

const cssRoot = (size: VIEW_SIZE): React.CSSProperties => ({
	display: "flex",
	height: 41,
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
	marginTop: 5,
	marginRight: 5,
}
