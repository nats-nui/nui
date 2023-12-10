import { ViewState, ViewStore } from "@/stores/docs/viewBase"
import { DOC_ANIM } from "@/types"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent, useEffect } from "react"
import DocCmp from "./DocCmp"
import styles from './DocViewCmp.module.css'



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

//if ( view.getParam(PARAMS_MESSAGES.CONNECTION_ID) == "cnn112345601") console.log("view",view.state.docAnim, view.getStyAni())

	const styContainerDoc = {
		...viewSa.styInit,
		width: viewSa.width,
		...view.getStyAni(),
		zIndex: deep,
	}

	return <div style={styContainer} className={styles.container}>

		<div style={styContainerDoc} className={clsDoc}>

			{/* BODY */}
			<DocCmp view={view} />

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

	boxShadow: "2px 2px 2px 0px rgba(0, 0, 0, 0.40)",
})

const cssDesk: React.CSSProperties = {
	marginLeft: -8,
	display: "flex",
	//height: "100%",
	position: "relative",
}
