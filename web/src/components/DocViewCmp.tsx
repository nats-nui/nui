import { getID } from "@/stores/docs/utils"
import { numLinkedParent } from "@/stores/docs/utils/manage"
import React, { FunctionComponent } from "react"
import DocCmp from "./DocCmp"
import { ViewStore } from "@/stores/docs/doc"



interface Props {
	view?: ViewStore
	style?: React.CSSProperties
}

const DocViewCmp: FunctionComponent<Props> = ({
	view,
	style,
}) => {

	// HANDLER

	// RENDER
	if (!view) return null
	const haveLinked = !!view.state.linked
	const haveStacked = view.state.stacked && view.state.stacked.length > 0
	const deep = numLinkedParent(view)

	return <div style={{ ...cssContainer, ...style }}>

		<div style={cssDoc(deep)}>

				{/* STACKED */}
				{haveStacked && <div style={cssStacked}>
					{view.state.stacked.map(stkView => <DocViewCmp key={getID(stkView)} view={stkView} />)}
				</div>}

			{/* BODY */}
			<DocCmp view={view} />

		</div>

		{/* LINKED */}
		{haveLinked && <div style={cssLinked}>
			<DocViewCmp view={view.state.linked} />
		</div>}

	</div>
}

export default DocViewCmp


const cssContainer: React.CSSProperties = {
	display: "flex",
}
const cssDoc = (deep: number): React.CSSProperties => ({
	display: "flex",
	flexDirection: "column",
	zIndex: 100-deep,

	overflow: "hidden",
	borderRadius: deep==0 ? 10 : '0px 10px 10px 0px',
	
	boxShadow: "2px 2px 2px 0px rgba(0, 0, 0, 0.40)",
})

const cssStacked: React.CSSProperties = {
	display: "flex",
	flexDirection: "column",
}
const cssLinked: React.CSSProperties = {
	marginLeft: "-8px",
	display: "flex",
}
