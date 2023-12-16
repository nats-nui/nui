import layoutSo from "@/stores/layout"
import React, { FunctionComponent } from "react"



interface Props {
	children: React.ReactNode
	style?: React.CSSProperties
}

/**
 * Lo STACK di una collezione di CONNECTIONs
 */
const ActionGroup: FunctionComponent<Props> = ({
	children,
	style,
}) => {

	// STORE

	// HOOKs

	// HANDLER

	// RENDER
	return <div style={{ ...cssRoot, ...style }}>
		{children}
	</div>
}

export default ActionGroup

const cssRoot: React.CSSProperties = {
	display: "flex", gap: 5,
	alignItems: "center",
	//justifyContent: 'flex-end',
	padding: 3,
	backgroundColor: layoutSo.state.theme.palette.actionsGroup.bg,
	color: layoutSo.state.theme.palette.actionsGroup.fg,
}
