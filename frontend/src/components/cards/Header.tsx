import AnchorIcon from "@/icons/AnchorIcon"
import CloseIcon from "@/icons/CloseIcon"
import DirectionLeftIcon from "@/icons/DirectionLeftIcon"
import DetachIcon from "@/icons/DetachIcon"
import DirectionRightIcon from "@/icons/DirectionRightIcon"
import IconizedIcon from "@/icons/IconizeIcon"
import { deckCardsSo, drawerCardsSo } from "@/stores/docs/cards"
import { menuSo } from "@/stores/docs/links"
import { findParent, getRoot } from "@/stores/docs/utils/manage"
import mouseSo from "@/stores/mouse"
import { VIEW_SIZE } from "@/stores/stacks/utils"
import { ViewStore } from "@/stores/stacks/viewBase"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent, useMemo, useState } from "react"
import TooltipWrapCmp from "../tooltip/TooltipWrapCmp"
import IconButton from "../buttons/IconButton"
import CardIcon from "./CardIcon"
import cls from "./Header.module.css"
import docsSo from "@/stores/docs"



interface Props {
	store?: ViewStore
}

/** Tipico HEADER con icona e titolo. Lo trovi nel tipico FrameworkCard */
const Header: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	const docSo = store.state.group
	useStore(docSo)

	// HOOK
	const [enter, setEnter] = useState(false)

	// HANDLER
	const handleClose = () => {
		if (inZen) {
			docsSo.zenClose()
		} else {
			store.onRemoveFromDeck()
		}
	}
	const handleDragStart: React.DragEventHandler = (e) => {
		e.preventDefault();
		mouseSo.setPosition({ x: e.clientX, y: e.clientY })
		mouseSo.startDrag({ source: { view: store } })
	}
	const handleDetach = () => docSo.detach(store)
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
	const handleMoveInDrawer = () => {
		if (!inDrawer) {
			store.state.group.move({ view: store, groupDest: drawerCardsSo })
		} else {
			store.state.group.move({ view: store, groupDest: deckCardsSo })
		}
	}
	const handleFocus = () => {
		//e.stopPropagation()
		docSo.focus(store)
	}
	const handleToggleIconize = () => {
		if (!inMenu) {
			//store.state.group.remove({ view: store })
			menuSo.add({ view: store })
		}
		// else {
		// 	menuCardsSo.remove({ view: store })
		// }
	}
	const handleComprime = () => {
		findParent(store, (view) => view.setSize(VIEW_SIZE.COMPACT))
	}
	const handleExpand = () => {
		findParent(store, (view) => view.setSize(VIEW_SIZE.NORMAL))
	}
	const handleDClick = () => {
		if (inZen) return
		docsSo.zenOpen(store)
	}

	// RENDER
	const inZen = docsSo.state.zenCard == store
	const inDrawer = !inZen && store.state.group == drawerCardsSo
	const inMenu = !inZen && menuSo.find(store)
	const [title, subTitle] = useMemo(() => [
		store.getTitle(),
		store.getSubTitle(),
	], [store.state])
	const isDraggable = !inZen && store.state.draggable
	const haveLinkDetachable = store.state.linked?.state.draggable
	const inRoot = inZen || !store.state.parent
	const isCompact = !inZen && store.state.size == VIEW_SIZE.COMPACT
	const allCompact = !inZen && !findParent(store, view => view.state.size != VIEW_SIZE.COMPACT)

	const showBttAnchor = !inZen && inRoot && (enter || inDrawer)
	const showDetachable = !inZen && !inRoot && enter
	const showBttClose = !store.state.unclosable
	const showBttPin = !inZen && inRoot && enter && store.state.pinnable
	const showBttExpand = !inZen && allCompact && !inRoot && enter
	const showBttComprime = !inZen && !allCompact && !inRoot && enter

	const clsTitle = `${cls.title} ${store.state.size == VIEW_SIZE.COMPACT ? cls.compact : ""}`
	const clsRoot = `${cls.root} ${store.state.size == VIEW_SIZE.COMPACT ? cls.compact : ""}`

	return (
		<div className={clsRoot}
			draggable={isDraggable}
			onDragStart={!inZen ? handleDragStart : undefined}
			onMouseEnter={() => setEnter(true)}
			onMouseLeave={() => setEnter(false)}
		>

			{!!store.state.type && (
				<div onClick={!inZen ? handleSizeClick : undefined} className="cliccable"
					style={{ margin: 8, alignSelf: "center" }}
				>
					<TooltipWrapCmp
						disabled={!isCompact}
						content={<div>
							<div className="lbl-header-title">{title}</div>
							<div className="lbl-header-subtitle">{subTitle}</div>
						</div>}
					>
						<CardIcon
							type={store.state.type}
						/>
					</TooltipWrapCmp>
				</div>
			)}

			{!isCompact && <>

				<div className={clsTitle}
					onDoubleClick={handleDClick}
				>
					<div className="lbl-header-title draggable"
						onClick={!inZen ? handleFocus : undefined}
					>{title}</div>
					{subTitle && (
						<div className="lbl-header-subtitle">
							{subTitle}
						</div>
					)}
				</div>

				<div className={cls.buttons}>
					<div style={{ display: "flex" }}>
						{showBttExpand && (
							<IconButton
								onClick={handleExpand}
							><DirectionRightIcon /></IconButton>
						)}
						{showBttComprime && (
							<IconButton
								onClick={handleComprime}
							><DirectionLeftIcon /></IconButton>
						)}
						{showBttPin && (
							<IconButton
								onClick={handleToggleIconize}
							><IconizedIcon /></IconButton>
						)}
						{showBttAnchor && (
							<IconButton
								onClick={handleMoveInDrawer}
							><AnchorIcon /></IconButton>
						)}
						{showDetachable && (
							<IconButton
								onClick={handleDetach}
							><DetachIcon /></IconButton>
						)}
						{showBttClose && (
							<IconButton
								onClick={handleClose}
							><CloseIcon /></IconButton>
						)}
					</div>
					{/* {haveLinkDetachable && <IconButton
						onClick={handleLinkDetach}
					><DetachIcon /></IconButton>} */}
				</div>

			</>}

		</div>
	)
}

export default Header
