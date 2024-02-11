import { FunctionComponent } from "react"



interface Props {
	style?: React.CSSProperties
	children?: React.ReactNode
}

const Quote: FunctionComponent<Props> = ({
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

export default Quote

const cssRoot: React.CSSProperties = {
	display: "flex",
	flexDirection: "column",
	gap: "5px",
	borderLeft: '2px solid rgba(0, 0, 0, 0.4)',
	paddingLeft: "5px",
	paddingBottom: "5px",

}
