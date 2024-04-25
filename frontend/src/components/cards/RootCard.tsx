import { CardsState } from "@/stores/docs/cards"
import { ViewStore } from "@/stores/stacks/viewBase"
import { DOC_ANIM } from "@/types"
import { useStore, useStoreNext } from "@priolo/jon"
import React, { FunctionComponent, useEffect } from "react"
import PolymorphicCard from "./PolymorphicCard"
import cls from "./RootCard.module.css"
import SnackbarCmp from "./SnackbarCmp"
import DraggableCmp from "./DraggableCmp"
import CornerDragIcon from "@/icons/CornerDragIcon"



interface Props {
	view?: ViewStore
	deep?: number
}

/** Il contenitore CARD. Gestisce il drag e posizionamento del DECK */
const RootCard: FunctionComponent<Props> = ({
	view,
	deep = 100,
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
	const inRoot = !view.state.parent
	const inAnimation = viewSa.docAnim == DOC_ANIM.EXITING || viewSa.docAnim == DOC_ANIM.SHOWING || viewSa.docAnim == DOC_ANIM.SIZING
	const haveLinked = !!view.state.linked
	const haveFocus = view.state.group.state.focus == view
	const variant = view.state.colorVar

	// styles
	const clsAnimation = inAnimation ? cls.animation : ""
	const clsRoot = `${cls.root} ${clsAnimation}`
	const clsDoc = `var${variant} ${haveFocus ? cls.focus : ""} ${cls.doc} ${!inRoot ? cls.is_linked : ""}`
	const styContainerDoc: React.CSSProperties = {
		zIndex: deep,
		width: view.getWidth(),
		...view.getStyAni(),
	}
	console.log(view.state.docAnim)

	return <div
		id={view.state.uuid}
		className={clsRoot}
		style={{ zIndex: deep }}
	>

		{/* DOC BODY */}
		<div style={styContainerDoc} className={clsDoc}>
			<PolymorphicCard view={view} />
			<SnackbarCmp view={view} />
			<DraggableCmp
				className={cls.draggable}
				onStart={(pos: number) => view.state.width}
				onMove={handleDragMove}
			><CornerDragIcon /></DraggableCmp>
		</div>

		<div className={cls.desk}>

			{/* DIALOG */}
			<div
				className={`var${variant} ${cls.dialog}`}
				style={{ zIndex: deep - 1 }}
				id={`dialog_${view.state.uuid}`}
			/>

			{/* LINKED */}
			{haveLinked && <div >
				<RootCard
					deep={deep - 2}
					view={view.state.linked}
				/>
			</div>}

		</div>
	</div>
}

export default RootCard
