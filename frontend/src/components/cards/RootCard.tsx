import docsSo from "@/stores/docs"
import { CardsState } from "@/stores/docs/cards"
import { VIEW_SIZE } from "@/stores/stacks/utils"
import { ViewStore } from "@/stores/stacks/viewBase"
import { DOC_ANIM } from "@/types"
import { useStore, useStoreNext } from "@priolo/jon"
import React, { FunctionComponent, useEffect } from "react"
import PolymorphicCard from "./PolymorphicCard"
import ResizerCmp from "./ResizerCmp"
import cls from "./RootCard.module.css"
import SnackbarCmp from "./SnackbarCmp"



interface Props {
	view?: ViewStore
	deep?: number

	className?: string
	style?: React.CSSProperties
}

/** Il contenitore CARD. Gestisce il drag e posizionamento del DECK */
const RootCard: FunctionComponent<Props> = ({
	view,
	deep = 100,
	className = "",
	style = {},
}) => {

	// STORES
	const viewSa = useStore(view)
	useStoreNext(view.state.group, (state: CardsState, stateOld: CardsState) => state.focus != stateOld.focus)

	// HOOKS
	useEffect(() => {
		window.requestAnimationFrame(() => view.docAnim(DOC_ANIM.SHOWING));
	}, [view])

	// HANDLER
	const handleDragMove = (pos: number, diff: number) => view.setWidth(pos - diff)

	// RENDER
	if (!view) return null
	const inZen = docsSo.state.zenCard == view
	const inRoot = inZen || !view.state.parent
	const inAnimation = viewSa.docAnim == DOC_ANIM.EXITING || viewSa.docAnim == DOC_ANIM.SHOWING || viewSa.docAnim == DOC_ANIM.SIZING
	const isCompact = !inZen && viewSa.size == VIEW_SIZE.COMPACT
	const isResizable = !isCompact && !inZen
	const haveLinked = !inZen && !!view.state.linked
	const haveFocus = !inZen && view.state.group.state.focus == view
	const variant = view.state.colorVar

	const dialogId = `dialog_${view.state.uuid}`

	// styles
	const clsAnimation = inAnimation ? cls.animation : ""
	const clsRoot = `${cls.root} ${clsAnimation} ${className}`
	const clsDoc = `var${variant} ${haveFocus ? cls.focus : ""} ${cls.doc} ${!inRoot ? cls.is_linked : ""}`
	const styContainerDoc: React.CSSProperties = {
		zIndex: deep,
		width: view.getWidth(),
		maxWidth: view.state.widthMax,
		minWidth: view.state.widthMin,
		...view.getStyAni(),
	}

	return <div
		id={view.state.uuid}
		className={clsRoot}
		style={{ zIndex: deep, ...style }}
	>

		{/* DOC BODY */}
		<div style={styContainerDoc} className={clsDoc}>
			<PolymorphicCard view={view} />
			<SnackbarCmp view={view} />

		</div>

		{isResizable && <ResizerCmp
			className={cls.resizer}
			onStart={(pos: number) => view.state.width}
			onMove={handleDragMove}
		/>}

		<div className={cls.desk}>

			{/* DIALOG */}
			<div
				className={`var${variant} ${cls.dialog}`}
				style={{ zIndex: deep - 1 }}
				id={dialogId}
			/>

			{/* LINKED */}
			{!inZen && haveLinked && <div >
				<RootCard
					deep={deep - 2}
					view={view.state.linked}
				/>
			</div>}

		</div>
	</div>
}

export default RootCard
