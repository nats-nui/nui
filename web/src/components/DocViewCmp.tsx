import { ViewStore } from "@/stores/docs/docBase"
import mouseSo, { MouseState } from "@/stores/mouse"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent, useEffect, useState } from "react"
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
	const viewSa = useStore(view)
	const mouseSa: MouseState = useStore(mouseSo)

	// HOOKS
	const [isVisible, setIsVisible] = useState(false);
	useEffect(() => {
		setIsVisible(true);
	}, []);

	// HANDLER

	// RENDER
	if (!view) return null
	const inRoot = !view.state.parent
	const haveDialog = !!view.state.dialogCmp
	const haveLinked = !!view.state.linked
	const inDrag = mouseSa.drag?.srcView == view

	// style
	const clsContainer = `${styles.container} ${isVisible ? styles.appear : ''}`
	const clsDoc = `${styles.doc} ${isVisible ? styles.doc_appear : ''} ${inRoot ? "" : styles.doc_sub} ${inDrag ? styles.doc_detached : styles.doc_attached}`
	const styContainer = {
		...{ zIndex: deep },
	}
	const styContainerDoc = {
		...{ zIndex: deep },
	}

	return <div style={styContainer} className={clsContainer}>

		<div style={styContainerDoc} className={clsDoc}>

			{/* BODY */}
			<DocCmp view={view} />

		</div>

		<div style={cssDesk}>

			{/* DIALOG */}
			{haveDialog && <div style={cssDialog(deep - 1)}>
				{view.state.dialogCmp}
			</div>}

			{/* LINKED */}
			{haveLinked && <div >
				<DocViewCmp view={view.state.linked} deep={deep - 2} />
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
	marginLeft: "-8px",
	display: "flex",
	//height: "100%",
	position: "relative",
}
