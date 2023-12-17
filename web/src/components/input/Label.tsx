import React, { FunctionComponent } from "react"



interface Props {
	isTitle?: boolean
	children?: React.ReactNode
}

const Label: FunctionComponent<Props> = ({
	isTitle = false,
	children,
}) => {

	// STORE

	// HOOK

	// HANDLER

	// RENDER
	const css = isTitle ? cssTitle : cssNormal
	return <div
		style={{...cssRoot, ...css}}
	>
		{children}
	</div>
}

export default Label

const cssNormal: React.CSSProperties = {
	fontSize: 12,
	fontWeight: 600,
	marginTop: 5,
}
const cssTitle: React.CSSProperties = {
	fontSize: 14,
	fontWeight: 800,
	marginBottom: 10,
}
const cssRoot: React.CSSProperties = {
	display: "flex",
	alignItems: "center",
}
