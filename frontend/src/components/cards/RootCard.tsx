import docSo from "@/stores/docs"
import layoutSo, { COLOR_VAR } from "@/stores/layout"
import { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { ANIM_TIME_CSS, DOC_ANIM } from "@/types"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent, useEffect } from "react"
import PolymorphicCard from "./PolymorphicCard"
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
	const viewSa = useStore(view) as ViewState
	const docSa = useStore(docSo)

	// HOOKS
	useEffect(() => {
		window.requestAnimationFrame(() => view.docAnim(DOC_ANIM.SHOWING));
	}, [view])

	// HANDLER

	// RENDER
	if (!view) return null
	const inRoot = !view.state.parent
	const haveLinked = !!view.state.linked
	const haveFocus = docSa.focus == view
	const variant = viewSa.colorVar

	// styles
	const styContainerDoc: React.CSSProperties = {
		...cssDoc,
		borderRadius: inRoot ? 5 : "0px 5px 5px 0px",
		transition: `transform 300ms, width ${ANIM_TIME_CSS}ms`,
		zIndex: deep,
		width: view.getWidth(),
		...haveFocus ? { /*boxSizing: "border-box",*/ border: `2px solid ${layoutSo.state.theme.palette.var[variant].bg}` } : {},
		...view.getStyAni(),
	}

	return <div
		id={view.state.uuid}
		style={cssRoot(deep)}
		className={`var${variant}`}
	>

		{/* DOC BODY */}
		<div style={styContainerDoc}>
			<PolymorphicCard view={view} />
			<SnackbarCmp view={view} />
			{!!view.state.loadingMessage && (
				<div style={cssLoading}>
					<div>{view.state.loadingMessage}</div>
				</div>
			)}
		</div>

		<div style={cssDesk}>

			{/* DIALOG */}
			<div
				style={cssDialog(deep - 1)}
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

const cssRoot = (deep: number): React.CSSProperties => ({
	zIndex: deep,
	display: "flex",
	height: "100%",
})

const cssDoc: React.CSSProperties = {
	position: "relative",
	display: "flex",
	flexDirection: "column",
	overflow: "hidden",
	color: layoutSo.state.theme.palette.var[COLOR_VAR.DEFAULT].fg,
	backgroundColor: layoutSo.state.theme.palette.var[COLOR_VAR.DEFAULT].bg,
	transitionTimingFunction: layoutSo.state.theme.transitions[0],
	boxShadow: layoutSo.state.theme.shadows[0],
}

const cssDialog = (deep: number): React.CSSProperties => ({
	position: "absolute",
	zIndex: deep,
	height: "100%",
})

const cssDesk: React.CSSProperties = {
	marginLeft: -8,
	display: "flex",
	position: "relative",
}

const cssLoading: React.CSSProperties = {
	position: 'absolute',
	height: 'calc(100% - 48px)',
	width: '100%',
	backgroundColor: 'rgba(0, 0, 0, 0.6)',
	zIndex: '1',
	display: 'flex', flexDirection: "column",
	alignItems: 'center',
	justifyContent: 'center',
	bottom: '0px',
}