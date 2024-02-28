import { FunctionComponent } from "react"



interface Props {
	style?: React.CSSProperties
	children?: React.ReactNode
}

const BoxFloat: FunctionComponent<Props> = ({
	style,
	children,
}) => {
	// STORE

	// HOOK

	// HANDLER

	// RENDER
	return (
		<div style={{ ...cssRoot, ...style }} >
			{children}
		</div>
	)
}

export default BoxFloat

const cssRoot:React.CSSProperties = {
	position: "absolute",
	bottom: 20, right: 20,
	display: "flex", 
	gap: 5,
}
