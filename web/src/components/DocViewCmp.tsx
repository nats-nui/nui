import { ViewState, ViewStore } from "@/stores/docs/viewBase"
import { ANIM_TIME_CSS, DOC_ANIM } from "@/types"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent, useEffect } from "react"
import DocCmp from "./DocCmp"
import styles from './DocViewCmp.module.css'
import layoutSo from "@/stores/layout"


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

	// HOOKS
	useEffect(() => {
		window.requestAnimationFrame(() => view.docAnim(DOC_ANIM.SHOWING));
	}, [view])

	// HANDLER

	// RENDER
	if (!view) return null
	const inRoot = !view.state.parent
	const haveLinked = !!view.state.linked

	// style
	const clsDoc = `${styles.doc} ${inRoot ? "" : styles.doc_sub}`//${clsDocAnim}`

	const styContainer = {
		zIndex: deep,
	}
	const styContainerDoc = {
		transition: `transform 300ms, width ${ANIM_TIME_CSS}ms`,
		transitionTimingFunction: "cubic-bezier(0.000, 0.350, 0.225, 1.175)",
		width: viewSa.width,
		zIndex: deep,
		boxShadow: layoutSo.state.theme.shadows[0],
		...view.getStyAni(),
	}
	const styDoc = {
		transition: `opacity ${ANIM_TIME_CSS}ms`,
		opacity: view.state.docAnim == DOC_ANIM.DRAGGING ? .3 : null
	}

	return <div style={styContainer} className={styles.container}>

		<div style={styContainerDoc} className={clsDoc}>

			{/* BODY */}
			<DocCmp view={view} style={styDoc} />

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
