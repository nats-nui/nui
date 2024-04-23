import { CardsState } from "@/stores/docs/cards"
import { ViewStore } from "@/stores/stacks/viewBase"
import { DOC_ANIM } from "@/types"
import { useStore, useStoreNext } from "@priolo/jon"
import React, { FunctionComponent, useEffect } from "react"
import PolymorphicCard from "./PolymorphicCard"
import cls from "./RootCard.module.css"
import SnackbarCmp from "./SnackbarCmp"



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

	// RENDER
	if (!view) return null
	const inRoot = !view.state.parent
	const inAnimation = viewSa.docAnim == DOC_ANIM.EXITING || viewSa.docAnim == DOC_ANIM.SHOWING
	const haveLinked = !!view.state.linked
	const haveFocus = view.state.group.state.focus == view
	const variant = view.state.colorVar

	// styles
	const styContainerDoc: React.CSSProperties = {
		zIndex: deep,
		width: view.getWidth(),
		...view.getStyAni(),
	}
	const clsDoc = `var${variant} ${cls.doc} ${haveFocus ? "card-focus" : ""} ${!inRoot ? cls.is_linked : ""}`
	const clsRoot = `${cls.root} ${inAnimation ? cls.animation : ""}`

	return <div
		id={view.state.uuid}
		className={clsRoot}
		style={{ zIndex: deep }}
	>

		{/* DOC BODY */}
		<div style={styContainerDoc} className={clsDoc}>
			<PolymorphicCard view={view} />
			<SnackbarCmp view={view} />
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
