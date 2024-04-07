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
const RootCmpCard: FunctionComponent<Props> = ({
	view,
	deep = 100,
}) => {

	// STORES
	const viewSa = useStore(view)
	useStore(view.state.group)

	// HOOKS
	useEffect(() => {
		window.requestAnimationFrame(() => view.docAnim(DOC_ANIM.SHOWING));
	}, [view])

	// HANDLER

	// RENDER
	if (!view) return null
	const inRoot = !view.state.parent
	const haveLinked = !!view.state.linked
	const haveFocus = false//docSa.focus == view
	const variant = view.state.colorVar

	// styles
	const styContainerDoc: React.CSSProperties = {
		zIndex: deep,
		width: view.getWidth(),
		...view.getStyAni(),
	}
	const clsDoc = `var${variant} ${cls.doc} ${haveFocus ? "card-focus" : ""} ${!inRoot ? cls.is_linked : ""}`

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

const RootCard = React.memo(
	RootCmpCard,
	(prev, curr) => prev.view == curr.view && prev.deep == curr.deep
)
export default RootCard


// const cssDoc: React.CSSProperties = {
// 	position: "relative",
// 	display: "flex",
// 	flexDirection: "column",
// 	overflow: "hidden",
// 	color: "var(--text)", //layoutSo.state.theme.palette.var[COLOR_VAR.DEFAULT].fg,
// 	backgroundColor: "var(--bg-default)", //layoutSo.state.theme.palette.var[COLOR_VAR.DEFAULT].bg,
// 	transitionTimingFunction: "cubic-bezier(0.000, 0.350, 0.225, 1.175)",
// 	boxShadow: 'rgba(0, 0, 0, 0.4) 1px 1px 0px 0px',
// }

// const cssDialog = (deep: number): React.CSSProperties => ({
// 	position: "absolute",
// 	zIndex: deep,
// 	height: "100%",
// })

// const cssDesk: React.CSSProperties = {
// 	marginLeft: -8,
// 	display: "flex",
// 	position: "relative",
// }
