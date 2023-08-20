import { getID } from "@/stores/docs/utils"
import { numLinkedParent } from "@/stores/docs/utils/manage"
import React, { FunctionComponent } from "react"
import DocCmp from "./DocCmp"
import { ViewStore } from "@/stores/docs/docBase"
import { useStore } from "@priolo/jon"



interface Props {
	view?: ViewStore
	style?: React.CSSProperties
	deep?: number
}

const DocViewCmp: FunctionComponent<Props> = ({
	view,
	style,
	deep = 100,
}) => {

	// STORES
	const viewSa = useStore(view)

	// HANDLER

	// RENDER
	if (!view) return null
	const inRoot = !view.state.parent
	const haveDialog = !!view.state.dialogCmp
	const haveLinked = !!view.state.linked
	const haveStacked = view.state.stacked && view.state.stacked.length > 0

	return <div style={{ ...cssContainer(deep), ...style }}>

		<div style={cssDoc(deep, inRoot)}>

			{/* STACKED */}
			{haveStacked && <div style={cssStacked}>
				{view.state.stacked.map(stkView => <DocViewCmp key={getID(stkView)} view={stkView} />)}
			</div>}

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


const cssContainer = (deep: number): React.CSSProperties => ({
	display: "flex",
	height: "100%",
	zIndex: deep,
})
const cssDoc = (deep: number, inRoot: boolean): React.CSSProperties => ({
	display: "flex",
	flexDirection: "column",
	zIndex: deep,

	overflow: "hidden",
	borderRadius: inRoot ? 10 : '0px 10px 10px 0px',

	color: "white",
	backgroundColor: "#3E3E3E",
	boxShadow: "2px 2px 2px 0px rgba(0, 0, 0, 0.40)",
})

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


const cssStacked: React.CSSProperties = {
	display: "flex",
	flexDirection: "column",
}
const cssDesk: React.CSSProperties = {
	marginLeft: "-8px",
	display: "flex",
	//height: "100%",
	position: "relative",

}
