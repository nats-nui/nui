import { ViewStore } from "@/stores/stacks/viewBase"
import { DOC_ANIM } from "@/types"
import { useStore } from "@priolo/jon"
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
	//useStore(view.state.group)
	
	// HOOKS
	useEffect(() => {
		window.requestAnimationFrame(() => view.docAnim(DOC_ANIM.SHOWING));
	}, [view])

	// HANDLER

	// RENDER
	if (!view) return null
	const inRoot = !view.state.parent
	const haveLinked = !!view.state.linked
	//const haveFocus = view.state.group.state.focus == view
	const variant = view.state.colorVar

	// styles
	const styContainerDoc: React.CSSProperties = {
		zIndex: deep,
		width: view.getWidth(),
		...view.getStyAni(),
	}
	const clsDoc = `var${variant} ${cls.doc} ${/*haveFocus*/false ? "card-focus" : ""} ${!inRoot ? cls.is_linked : ""}`

	return <div
		id={view.state.uuid}
		className={cls.root}
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

// const RootCard = React.memo(
// 	RootCmpCard,
// 	//(prev, curr) => prev.view?.state == curr.view?.state && prev.deep == curr.deep
// 	(prev, curr) => prev.view == curr.view && prev.deep == curr.deep
// )

// const RootCardMemo = React.memo(
// 	RootCmpCard,
// 	(prev, curr) => prev.view == curr.view && prev.deep == curr.deep
// )

// const RootCard = RootCmpCard

export default RootCard
