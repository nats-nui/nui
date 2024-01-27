import docSo from "@/stores/docs"
import layoutSo, { COLOR_VAR } from "@/stores/layout"
import { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { ANIM_TIME_CSS, DOC_ANIM } from "@/types"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent, useEffect } from "react"
import DocCmp from "./DocCmp"



interface Props {
	view?: ViewStore
	deep?: number
}

/** Il contenitore CARD. Gestisce il drag e posizionamento del DECK */
const DocViewCmp: FunctionComponent<Props> = ({
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
		borderRadius: inRoot ? 10 : "0px 10px 10px 0px",
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
			<DocCmp view={view} />
			{/* <ModalCmp view={view} /> */}
		</div>

		<div style={cssDesk}>

			{/* DIALOG */}
			<div
				style={cssDialog(deep - 1)}
				id={`dialog_${view.state.uuid}`}
			/>

			{/* LINKED */}
			{haveLinked && <div >
				<DocViewCmp
					deep={deep - 2}
					view={view.state.linked}
				/>
			</div>}

		</div>
	</div>
}

export default DocViewCmp

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

	//display: "flex",
	//flexDirection: "column",

	//overflow: "hidden",
	//borderRadius: '0px 10px 10px 0px',

	//boxShadow: layoutSo.state.theme.shadows[0],
})

const cssDesk: React.CSSProperties = {
	marginLeft: -8,
	display: "flex",
	//height: "100%",
	position: "relative",
}

const cssSnackbar: React.CSSProperties = {
	position: "absolute",
	bottom: 0, left: 0, right: 0,

	margin: 5,
	padding: 5,
	borderRadius: 10,
	backgroundColor: "black",

}