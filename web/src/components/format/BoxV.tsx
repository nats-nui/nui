import { FunctionComponent } from "react"



interface Props {
	style?: React.CSSProperties
	children?: React.ReactNode
}

const BoxV: FunctionComponent<Props> = ({
	style,
	children,
}) => {
	// STORE

	// HOOK

	// HANDLER

	// RENDER
	return (
		<div style={{ ...cssRoot, ...style }}>
			{children}
		</div>
	)
}

export default BoxV

const cssRoot:React.CSSProperties = {
	display: "flex", 
	flexDirection: "column",
	position: "relative",
	//gap: 5,
}
