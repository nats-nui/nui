import { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent } from "react"



interface Props {
	view?: ViewStore
}

/** Il contenitore CARD. Gestisce il drag e posizionamento del DECK */
const ModalCmp: FunctionComponent<Props> = ({
	view,
}) => {

	// STORES
	const viewSa = useStore(view) as ViewState

	// HOOKS

	// HANDLER

	// RENDER

	return (

			<div style={cssRoot}>
				<div style={cssHeader}>

				</div>
				CIAO
			</div>
	)
}

export default ModalCmp

const cssRoot: React.CSSProperties = {
	position: "absolute",
	bottom: 0, left: 0, right: 0,
	margin: 15,
	padding: 5,
	borderRadius: 10,
	backgroundColor: "black",

}

const cssHeader: React.CSSProperties = {

}