import React, { FunctionComponent } from "react"



interface Props {
	children?: React.ReactNode
}

const Label: FunctionComponent<Props> = ({
	children,
}) => {

	// STORE

	// HOOK

	// HANDLER

	// RENDER
	return <div style={cssRoot}>{children}</div>
}

export default Label

const cssRoot: React.CSSProperties = {
	fontSize: '12px',
	fontWeight: '600',
	marginTop: '5px',
}
