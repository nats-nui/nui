import { VIEW_SIZE, ViewState, ViewStore } from "@/stores/docs/viewBase"
import { ANIM_TIME_CSS, DOC_ANIM } from "@/types"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent, useEffect } from "react"
import DocCmp from "./DocCmp"
import layoutSo from "@/stores/layout"
import { getID } from "@/stores/docs/utils/factory"
import Header from "./Header"
import docSo from "@/stores/docs"



interface Props {
	view?: ViewStore
	deep?: number
}

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

	// styles
	const styContainerDoc: React.CSSProperties = {
		...cssDoc,
		borderRadius: inRoot ? 10 : "0px 10px 10px 0px",
		transition: `transform 300ms, width ${ANIM_TIME_CSS}ms`,
		zIndex: deep,
		width: view.getWidth() + (haveFocus ? 100 : 0),
		...haveFocus ? { /*boxSizing: "border-box",*/ border: `1px solid ${layoutSo.state.theme.palette.var[0].bg}` } : {},
		...view.getStyAni(),
	}
	const styDoc = {
		transition: `opacity ${ANIM_TIME_CSS}ms`,
		opacity: view.state.docAnim == DOC_ANIM.DRAGGING ? .3 : null
	}

	return <div style={cssRoot(deep)} id={getID(view.state)}>

		{/* DOC BODY */}
		<div style={styContainerDoc}>
			{viewSa.size != VIEW_SIZE.ICONIZED ? (
				<DocCmp view={view} style={styDoc} />
			) : (
				<Header view={view} />
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
	display: "flex",
	flexDirection: "column",
	overflow: "hidden",
	color: layoutSo.state.theme.palette.default.fg,
	backgroundColor: layoutSo.state.theme.palette.default.bg,
	transitionTimingFunction: "cubic-bezier(0.000, 0.350, 0.225, 1.175)",
	boxShadow: layoutSo.state.theme.shadows[0],
}

const cssDialog = (deep: number): React.CSSProperties => ({
	position: "absolute",
	zIndex: deep,
	height: "100%",

	display: "flex",
	flexDirection: "column",

	overflow: "hidden",
	borderRadius: '0px 10px 10px 0px',

	boxShadow: layoutSo.state.theme.shadows[0],
})

const cssDesk: React.CSSProperties = {
	marginLeft: -8,
	display: "flex",
	//height: "100%",
	position: "relative",
}

