import { FunctionComponent } from "react"



interface Props {
	style?: React.CSSProperties
	children?: React.ReactNode
}

const Form: FunctionComponent<Props> = ({
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

export default Form

const cssRoot: React.CSSProperties = {
	display: "flex",
	flexDirection: "column",
	gap: 10,
	marginBottom: 15,
}
